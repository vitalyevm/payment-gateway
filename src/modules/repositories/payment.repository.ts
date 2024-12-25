import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payment, PaymentDocument } from '../schemas/payment.schema';

@Injectable()
export class PaymentRepository {
  constructor(
    @InjectModel(Payment.name)
    private readonly paymentModel: Model<PaymentDocument>,
  ) {}

  async findOne(filter: any): Promise<PaymentDocument> {
    return this.paymentModel.findOne(filter).exec();
  }

  async create(data: Partial<Payment>): Promise<PaymentDocument> {
    return new this.paymentModel(data).save();
  }

  async findById(id: string): Promise<PaymentDocument> {
    return this.paymentModel.findById(id).exec();
  }

  async updateStatus(id: string, status: string) {
    return this.paymentModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .exec();
  }
}
