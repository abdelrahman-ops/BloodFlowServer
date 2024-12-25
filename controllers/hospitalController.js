// createHospital,
//     getHospitals,
//     getHospitalById,
//     updateHospital,
//     deleteHospital,

import Hospital from '../models/hospitalModel.js';
const createHospital = async (req, res) => {
    try{
        const hospital = new Hospital(req.body);
        await hospital.save();
        res.status(201).json(hospital);
    }catch(error){
        res.status(400).json({ message: error.message });
    }
 }
const getHospitals = async (req, res) => { 
    try{
        const hospitals = await Hospital.find();
        res.status(200).json(hospitals);
    }catch(error){
        res.status(404).json({ message: error.message });
    }
}
const getHospitalById = async (req, res) => {
    try{
        const hospital = await Hospital.findById(req.params.id);
        res.status(200).json(hospital);
    }catch(error){
        res.status(404).json({ message: error.message });
    }
 }
const updateHospital = async (req, res) => { 
    try{
        const hospital = await Hospital.findByIdAndUpdate(req.params.id, req.body);
        res.status(200).json(hospital);
    }catch(error){
        res.status(404).json({ message: error.message });
    }
}
const deleteHospital = async (req, res) => { 
    try{
        const hospital = await Hospital.findByIdAndDelete(req.params.id);
        res.status(200).json(hospital);
    }catch(error){
        res.status(404).json({ message: error.message });
    }
}

export {
    createHospital,
    getHospitals,
    getHospitalById,
    updateHospital,
    deleteHospital,
};