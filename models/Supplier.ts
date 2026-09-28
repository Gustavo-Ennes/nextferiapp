import { Document, Schema, models, model, Types } from "mongoose";

export interface ISupplier extends Document {
  _id: Types.ObjectId;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const SupplierSchema = new Schema<ISupplier>(
  {
    name: {
      type: String,
      required: [true, "Please provide the supplier name"],
      maxlength: [60, "name cannot be more than 60 characters"],
    },
  },
  {
    collection: "suppliers",
    timestamps: true,
  },
);

export default models.Supplier || model<ISupplier>("Supplier", SupplierSchema);
