// import mongoose from "mongoose";

// const BlogSchema = new mongoose.Schema({
//   title: { type: String, required: true, unique:true },
//   bannerImage: { type: String, required: true }, // main banner image filename
//   thumbnailImage: { type: String }, // renamed from redirectImage
//   redirectLink: { type: String },
//   metaTitle: { type: String, required: true },
//   metaDescription: { type: String, required: true },
//   description: { type: String, required: true }, // rich text HTML
// }, { timestamps: true });

// const Blog = mongoose.model('Blog', BlogSchema);
// export default Blog;  


import mongoose from "mongoose";

const BlogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: true },
    bannerImage: { type: String, required: true }, 
    thumbnailImage: { type: String }, // optional
    redirectLink: { type: String }, // optional
    metaTitle: { type: String, required: true },
    metaDescription: { type: String, required: true },
    description: { type: String, required: true }, 
    faqs: [
      {
        question: { type: String, required: true },
        answer: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

const Blog = mongoose.model("Blog", BlogSchema);
export default Blog;
