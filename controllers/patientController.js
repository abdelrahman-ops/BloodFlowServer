import Patient from "../models/Patient.js";

const registerPatient = async (req, res) => {
  try {
    const { name, bloodType, contactDetails, urgencyLevel } = req.body;

    if (!name || !bloodType || !contactDetails?.phone || !urgencyLevel) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    const newPatient = new Patient({
      name,
      bloodType,
      contactDetails,
      urgencyLevel,
    });

    await newPatient.save();

    res.status(201).json({ success: true, message: "Patient registered successfully", patient: newPatient });
  } catch (error) {
    console.error("Error registering patient:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const createRequest = async (req, res) => {
    try {
      const { patientId, bloodType, location, urgencyLevel } = req.body;
  
      if (!patientId || !bloodType || !location || !urgencyLevel) {
        return res.status(400).json({ success: false, message: "All fields are required." });
      }
  
      const newRequest = new Request({
        patientId,
        bloodType,
        location,
        urgencyLevel,
      });
  
      await newRequest.save();
  
      res.status(201).json({ success: true, message: "Request submitted successfully", request: newRequest });
    } catch (error) {
      console.error("Error creating request:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  };

  export { createRequest , registerPatient};
