import { randomUUID } from "crypto";

export default class Chat {
    private id: string;
    private number: string;

    constructor(id: string, number: string) {
        this.id = id;
        this.number = number;
    }

    static create(number: string) {
        const id = randomUUID();
        return new Chat(id, number);
    }

    getId() {
        return this.id;
    }

    getNumber() {
        return this.number;
    }
}