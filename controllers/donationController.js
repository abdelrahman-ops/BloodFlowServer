import Donation from "../models/Donation.js";

const createDonation = async (req, res) => { 
    try{
        const newDonation = new Donation(req.body);
        await newDonation.save();
    }catch(error){
        console.error(error);
        res.status(500).json({error: "Internal Server Error"});
    }
}


const getDonations = async (req, res) => {
    try{
        const donations = await Donation.find({});
        res.json(donations);
    }catch(error){
        console.error(error);
        res.status(500).json({error: "Internal Server Error"});
    }
 }

const getDonationById = async (req, res) => { 
    try{
        const donation = await Donation.findById(req.params.id);
        if(donation){
            res.json(donation);
        }else{
            res.status(404).json({error: "Donation not found"});
        }
    }catch(error){
        console.error(error);
        res.status(500).json({error: "Internal Server Error"});
    }
}

const updateDonation = async (req, res) => { 
    try{
        const donation = await Donation.findById(req.params.id);
        if(donation){
            donation.donor = req.body.donor || donation.donor;
            donation.bloodType = req.body.bloodType || donation.bloodType;
            donation.amount = req.body.amount || donation.amount;
            donation.donationDate = req.body.donationDate || donation.donationDate;
            donation.save();
            res.json(donation);
        }else{
            res.status(404).json({error: "Donation not found"});
        }
    }catch(error){
        console.error(error);
        res.status(500).json({error: "Internal Server Errorr"});
    }
}

const deleteDonation = async (req, res) => { 
    try{
        const donation = await Donation.findById(req.params.id);
        if(donation){
            await donation.remove();
            res.json({message: "Donation deleted successfully"});
        }}catch(error){
            console.error(error);
            res.status(500).json({error: "Internal Server Error"});
        }
    }

export { 
    createDonation,
    getDonations,
    getDonationById,
    updateDonation,
    deleteDonation,
}