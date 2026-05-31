/**
 * Mongoose Schema for WeightLog
 *
 * This file defines the data structure for logging a user's weight.
 * In a full MERN stack application, this would be a Mongoose model file.
 *
 * import mongoose, { Schema } from 'mongoose';
 *
 * const WeightLogSchema: Schema = new Schema({
 *   date: { type: Date, required: true },
 *   value: { type: Number, required: true },
 *   user: { type: Schema.Types.ObjectId, ref: 'User', required: true }
 * });
 *
 * export default mongoose.model('WeightLog', WeightLogSchema);
 *
 */

// For frontend demonstration purposes, this object represents the schema.
export const WeightLogSchema = {
  date: 'Date',
  value: 'Number',
  user: 'ObjectId',
};
