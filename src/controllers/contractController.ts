import mongoose from 'mongoose';
import {getAll} from '../controllers/controllerFactory';
import Contract from '../models/Contract';

export const getAllContracts = ()=> getAll(Contract);

