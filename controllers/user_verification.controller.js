const UserVerification = require('../models/user_verifications.model');
const User = require('../models/users.model'); 

exports.submitVerificationData = async (req, res) => {
    const userId = req.user.idusers;
    const { identity_name, address, phone_number, identity_type, identity_number, gender, birth_place, birth_date } = req.body;
    const identity_document = req.file ? `/identitas/${req.file.filename}` : null;

    if (!identity_name || !address || !phone_number || !identity_type || !identity_number || !gender || !birth_place || !birth_date || !identity_document) {
        return res.status(400).json({ message: 'Semua kolom data verifikasi harus diisi.' });
    }

    let formattedBirthDate;
    try {
        formattedBirthDate = new Date(birth_date).toISOString().split('T')[0];
        if (isNaN(new Date(formattedBirthDate).getTime())) {
            throw new Error('Format tanggal lahir tidak valid.');
        }
    } catch (dateError) {
        return res.status(400).json({ message: 'Format tanggal lahir tidak valid.', error: dateError.message });
    }

    try {
        const existingVerification = await UserVerification.getByUserId(userId);

        if (existingVerification) {
            await UserVerification.update( userId,
                identity_name,
                address,
                phone_number,
                identity_type,
                identity_number,
                gender,
                birth_place,
                formattedBirthDate,
                identity_document);
            return res.status(200).json({ message: 'Data verifikasi Anda berhasil diperbarui. Menunggu persetujuan admin.' });
        } else {
            const verificationId = await UserVerification.create( userId,
                identity_name,
                address,
                phone_number,
                identity_type,
                identity_number,
                gender,
                birth_place,
                formattedBirthDate,
                identity_document);
            return res.status(201).json({
                message: 'Data verifikasi berhasil dikirim. Menunggu persetujuan admin.',
                iduserverific: verificationId
            });
        }
    } catch (error) {
        console.error('Error in submitVerificationData:', error);
        res.status(500).json({ message: error.message || 'Gagal mengirim data verifikasi.' });
    }
};

exports.getVerificationStatus = async (req, res) => {
    const userId = req.user.idusers; 

    try {
        const user = await User.getById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Pengguna tidak ditemukan.' });
        }

        const verificationData = await UserVerification.getByUserId(userId);

        if (!verificationData) {
            return res.status(200).json({
                Usertatus: user.status, 
                verificationStatus: 'not_submitted', 
                message: 'Anda belum mengirimkan data verifikasi.'
            });
        }

        res.status(200).json({
            Usertatus: user.status, 
            verificationData: {
                identity_name: verificationData.identity_name,
                address: verificationData.address,
                phone_number: verificationData.phone_number,
                identity_type: verificationData.identity_type,
                identity_number: verificationData.identity_number,
                gender: verificationData.gender,
                birth_place: verificationData.birth_place,
                birth_date: verificationData.birth_date,
                identity_document: verificationData.identity_document ? `${req.protocol}://${req.get('host')}${verificationData.identity_document}` : null,
                verified_status: verificationData.verified_status,
                verified_at: verificationData.verified_at,
            },
            message: 'Data verifikasi ditemukan.'
        });

    } catch (error) {
        console.error('Error in getVerificationStatus:', error);
        res.status(500).json({ message: error.message || 'Gagal mengambil status verifikasi.' });
    }
};

exports.getAllVerificationRequests = async (req, res) => {
    try {
        const requests = await UserVerification.getAll();
        res.status(200).json(requests);
    } catch (error) {
        console.error('Error in getAllVerificationRequests:', error);
        res.status(500).json({ message: error.message || 'Gagal mengambil semua permintaan verifikasi.' });
    }
};

exports.getVerificationRequestById = async (req, res) => {
    const verificationId = req.params.id;

    try {
        const request = await UserVerification.getById(verificationId);
        if (!request) {
            return res.status(404).json({ message: 'Permintaan verifikasi tidak ditemukan.' });
        }
        res.status(200).json(request);
    } catch (error) {
        console.error('Error in getVerificationRequestById:', error);
        res.status(500).json({ message: error.message || 'Gagal mengambil permintaan verifikasi.' });
    }
};

exports.approveOrRejectVerification = async (req, res) => {
    const verificationId = req.params.id; 
    const { status: newStatus } = req.body; 

    if (!['approved', 'rejected'].includes(newStatus)) {
        return res.status(400).json({ message: 'Status tidak valid. Harus "approved" atau "rejected".' });
    }

    try {
        const verificationEntry = await UserVerification.getById(verificationId);
        if (!verificationEntry) {
            return res.status(404).json({ message: 'Permintaan verifikasi tidak ditemukan.' });
        }

        const updated = await UserVerification.updateVerificationStatus(verificationId, newStatus);
        if (!updated) {
            return res.status(500).json({ message: 'Gagal memperbarui status verifikasi.' });
        }

        if (newStatus === 'approved') {
            const userActivated = await User.markUserAsActive(verificationEntry.idusers);
            if (!userActivated) {
                console.warn(`Peringatan: Gagal mengubah status user ID ${verificationEntry.idusers} menjadi active.`);
            }
            return res.status(200).json({ message: 'Verifikasi berhasil disetujui dan status pengguna diaktifkan.', userId: verificationEntry.idusers });
        } else if (newStatus === 'rejected') {
            return res.status(200).json({ message: 'Verifikasi berhasil ditolak.', userId: verificationEntry.idusers });
        }

    } catch (error) {
        console.error('Error in approveOrRejectVerification:', error);
        res.status(500).json({ message: error.message || 'Gagal memproses permintaan verifikasi.' });
    }
};