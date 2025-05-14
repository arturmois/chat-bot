import Chat from "../src/Chat";

test("Should realize transition between steps", () => {
  const phoneNumber = "558381974276";
  const instanceKey = "B000";
  const chat = Chat.create(phoneNumber, instanceKey);
  expect(chat.getStep()).toBe("STEP_0");
  expect(chat.phoneNumber).toBe(phoneNumber);
  expect(chat.instanceKey).toBe(instanceKey);

  chat.sendWelcomeMessage();
  expect(chat.getStep()).toBe("STEP_1");

  const menuList = ["Opção 1", "Opção 2", "Opção 3"];
  chat.sendMenuMessage(menuList);
  expect(chat.getStep()).toBe("STEP_2");

  const productList = ["Produto 1", "Produto 2", "Produto 3"];
  chat.sendProductListMessage(productList);
  expect(chat.getStep()).toBe("STEP_3");

  chat.sendProductConfirmationMessage();
  expect(chat.getStep()).toBe("STEP_4");

  chat.sendNewProductQuestionMessage();
  expect(chat.getStep()).toBe("STEP_3");
});
