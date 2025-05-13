import axios from "axios";

export default interface WhatsappService {
  sendTextMessage(number: string, message: string, instanceKey: string): Promise<void>;
}

export class WhatsappAdapter implements WhatsappService {

  private BASE_URL = "http://localhost:3333";
  private ADMIN_TOKEN = "dpZXlBhaROC6lWg63opsAyZcx6hWjMxf0VYzZ32hIhZUAO3z9Bf9eehtDMRjXFE5";
  private BEARER_TOKEN = "FJKpuSkTBVtLjiDURZjIIr5G6W5lHgmbqUhkjhoc9GzY3jZEvlzaMF6svutH5HBd";

  async sendTextMessage(number: string, message: string, instanceKey: string): Promise<void> {
    let data = JSON.stringify({
      "id": number,
      "typeId": "user",
      "message": message,
      "options": {
        "delay": 0,
        "replyFrom": ""
      },
      "groupOptions": {
        "markUser": "ghostMention"
      }
    });
    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: `${this.BASE_URL}/message/text?key=${instanceKey}`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.BEARER_TOKEN}`
      },
      data: data
    };
    axios.request(config)
      .then((response) => {
        console.log("Message sent successfully");
      })
      .catch((error) => {
        console.log(error);
      });
  }
}