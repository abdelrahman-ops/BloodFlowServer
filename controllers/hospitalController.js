// createHospital,
//     getHospitals,
//     getHospitalById,
//     updateHospital,
//     deleteHospital,
import Hospital from "../models/Hospital.js"

const createHospital = async (req, res) => { }
const getHospitals = async (req, res) => {
    try {
    const hospitals = await Hospital.find().populate('admin', 'name email').populate('inventory');
    
    if (!hospitals || hospitals.length === 0) {
        return res.status(404).json({ message: 'No hospitals found' });
    }

    res.status(200).json(hospitals);
    } catch (error) {
    console.error('Error fetching hospitals:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
    }
};
const getHospitalById = async (req, res) => { }
const updateHospital = async (req, res) => { }
const deleteHospital = async (req, res) => { }

export {
    createHospital,
    getHospitals,
    getHospitalById,
    updateHospital,
    deleteHospital,
};