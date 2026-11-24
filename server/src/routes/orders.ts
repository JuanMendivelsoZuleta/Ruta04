import { Router } from "express";
import { parseCreateOrder, parseOrderListQuery } from "../lib/validation";
import * as orderService from "../services/orders.service";

export const ordersRouter = Router();

// Consultar pedidos y fotografías adquiridas por correo
ordersRouter.get("/", async (req, res) => {
  const { email } = parseOrderListQuery(req.query);
  const orders = await orderService.listOrdersByEmail(email);
  res.json({ data: orders, count: orders.length });
});

// Consultar un pedido por su número único
ordersRouter.get("/:orderNumber", async (req, res) => {
  const order = await orderService.getOrderByNumber(String(req.params.orderNumber));
  res.json({ data: order });
});

// Crear pedido DEMO (no procesa dinero)
ordersRouter.post("/", async (req, res) => {
  const input = parseCreateOrder(req.body);
  const order = await orderService.createOrder(input);
  res.status(201).json({ data: order });
});
