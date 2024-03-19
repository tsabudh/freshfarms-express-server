import mongoose from 'mongoose';
import { createOne, deleteOne, getAll } from '../controllers/controllerFactory';
import Contract from '../models/Contract';

export const getAllContracts =  getAll(Contract);

export const createContract = createOne(Contract);

export const deleteContract = deleteOne(Contract);