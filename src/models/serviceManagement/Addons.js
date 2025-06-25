// import mongoose from "mongoose";

// const AddonsSchema = new mongoose.Schema(
//   {
//     subCategory: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Subcategory",
//       required: true,
//     },
//     addons: [
//       {
//         addonsName: {
//           type: String,
//           required: true,
//         },
//         image: {
//           type: String,
//           required: true,
//         },
//         price: {
//           type: Number,
//           required: true,
//         },
//         samedaydelivery: {
//           type: String,
//           enum: ["Possible", "Not Possible"],
//           required: true,
//         },
//         addonsDescription: {
//           type: String,
//           required: true,
//         },
//         customizedInputs: [
//           {
//             type: String,
//           },
//         ],
//       },
//     ],
//   },
//   {
//     timestamps: true,
//   }
// );

// const Addons = mongoose.model("Addons", AddonsSchema);

// export default Addons;


import mongoose from "mongoose";

const AddonsSchema = new mongoose.Schema(
  {
    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subcategory",
      required: true,
    },
    addons: [
      {
        addonsName: {
          type: String,
          required: true,
        },
        image: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        samedaydelivery: {
          type: String,
          enum: ["Possible", "Not Possible"],
          required: true,
        },
        addonsDescription: {
          type: String,
          required: true,
        },
        customizedInputs: [
          {
            label: {
              type: String,
              required: true,
            },
            inputType: {
              type: String,
              required: true,
            },
            maxValue: {
              type: Number,
        
            },
          },
        ],
        createdAt: {
          type: Date,
          default: Date.now, 
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Addons = mongoose.model("Addons", AddonsSchema);

export default Addons;
