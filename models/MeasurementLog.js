/**
 * Mongoose Schema for MeasurementLog
 *
 * This file defines the data structure for logging a user's body measurements.
 * In a full MERN stack application, this would be a Mongoose model file.
 *
 * import mongoose, { Schema } from 'mongoose';
 *
 * const MeasurementLogSchema: Schema = new Schema({
 *   date: { type: Date, required: true },
 *   muscle: { type: String, required: true },
 *   value: { type: Number, required: true },
 *   user: { type: Schema.Types.ObjectId, ref: 'User', required: true }
 * });
 *
 * export default mongoose.model('MeasurementLog', MeasurementLogSchema);
 *
 */

// For frontend demonstration purposes, this object represents the schema.
export const MeasurementLogSchema = {
  date: 'Date',
  muscle: 'String',
  value: 'Number',
  user: 'ObjectId',
};
