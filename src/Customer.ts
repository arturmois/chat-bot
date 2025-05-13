export default class Customer {
  private id: number;
  private pushName: string;
  private phoneNumber: string;
  private instanceKey: string;
  private messageStep: string;

  constructor(id: number, pushName: string, phoneNumber: string, instanceKey: string, messageStep: string) {
    this.id = id;
    this.pushName = pushName;
    this.phoneNumber = phoneNumber;
    this.instanceKey = instanceKey;
    this.messageStep = messageStep;
  }

  static create(pushName: string, phoneNumber: string, instanceKey: string) {
    return new Customer(0, pushName, phoneNumber, instanceKey, "STEP_0");
  }

  getId() {
    return this.id;
  }

  getPhoneNumber() {
    return this.phoneNumber;
  }

  getPushName() {
    return this.pushName;
  }

  getInstanceKey() {
    return this.instanceKey;
  }

  getMessageStep() {
    return this.messageStep;
  }

  updateMessageStep(messageStep: string) {
    this.messageStep = messageStep;
  }
}