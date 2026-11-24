-- Evita fotografías repetidas dentro de un mismo pedido.
-- La BD de la demo estaba vacía, por lo que no hay duplicados previos.

-- DropIndex (cubierto por el índice único compuesto)
DROP INDEX "OrderItem_orderId_idx";

-- CreateIndex
CREATE UNIQUE INDEX "OrderItem_orderId_photoId_key" ON "OrderItem"("orderId", "photoId");
