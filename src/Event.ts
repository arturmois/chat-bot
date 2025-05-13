import { randomUUID } from "crypto";

export default class Event {
    private id: string;
    private number: string;
    private pushName: string;
    private message: string;
    private instanceKey: string;

    constructor(id: string, number: string, pushName: string, message: string, instanceKey: string) {
        this.id = id;
        this.number = number;
        this.pushName = pushName;
        this.message = message;
        this.instanceKey = instanceKey;
    }

    static create(number: string, pushName: string, message: string, instanceKey: string) {
        const id = randomUUID();
        return new Event(id, number, pushName, message, instanceKey);
    }

    getId() {
        return this.id;
    }

    getNumber() {
        return this.number;
    }

    getPushName() {
        return this.pushName;
    }

    getMessage() {
        return this.message;
    }

    getInstanceKey() {
        return this.instanceKey;
    }
}
