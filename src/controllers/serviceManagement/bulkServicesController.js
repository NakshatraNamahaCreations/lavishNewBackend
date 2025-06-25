import xlsx from "xlsx";
import fs from "fs";
import Service from "../../models/serviceManagement/Service.js"


export const bulkCreateServices = async (req, res) => {
  console.log("Request Body:", req.body);
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Excel file is required" });
    }

    const filePath = req.file.path;
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
    console.log("Parsed Excel Data:", data);
    // Validate and prepare data for insertion
    const servicesToInsert = [];
    const errors = [];

    data.forEach((row, index) => {
      try {
        // Validate required fields
        if (!row.serviceName || !row.originalPrice || !row.offerPrice) {
          throw new Error(`Row ${index + 2}: Missing required fields.`);
        }

        // Prepare service data with default values for optional fields
        servicesToInsert.push({
          serviceName: row.serviceName,
          categoryId: req.body.categoryId,
          subCategoryId: req.body.subCategoryId, 
          subSubCategoryId: req.body.subSubCategoryId || null,
          themeId: req.body.themeId || null,
          packageDetails: "", 
          requiredDetails: "", 
          customizedInputs: [],
          balloonColors: [], 
          originalPrice: parseFloat(row.originalPrice),
          offerPrice: parseFloat(row.offerPrice),
          images: [], 
        });
      } catch (error) {
        errors.push(error.message);
      }
    });

    // Insert valid services into the database
    const insertedServices = await Service.insertMany(servicesToInsert, { ordered: false }).catch(
      (err) => {
        if (err.code === 11000) {
          console.error("Duplicate key error:", err.message);
          errors.push("Duplicate key error: Some services were not inserted due to duplicate service names.");
        } else {
          throw err;
        }
      }
    );

    //    // Clean up uploaded file
    // await fs.unlink(filePath);

    return res.status(200).json({
      success: true,
      message: "Bulk services uploaded successfully.",
      dataCount: insertedServices ? insertedServices.length : 0,
      insertedServices,
      errors, // Return errors for invalid rows or duplicates
    });
  } catch (error) {
    console.error("Error in bulk upload:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to upload bulk services.",
      error: error.message,
    });
  }
};

