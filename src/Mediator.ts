export default class Mediator {
    private static instance: Mediator;
    private handlers: Map<string, ((data: any) => void)>;

    private constructor() {
        this.handlers = new Map();
    }

    public static getInstance(): Mediator {
        if (!Mediator.instance) {
            Mediator.instance = new Mediator();
        }
        return Mediator.instance;
    }

    public register(event: string, handler: (data: any) => void): void {
        this.handlers.set(event, handler);
    }

    public async notify(event: string, data: any): Promise<void> {
        const handler = this.handlers.get(event);
        if (!handler) {
            return;
        }
        handler(data);
    }
}