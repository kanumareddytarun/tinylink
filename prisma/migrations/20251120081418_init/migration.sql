-- CreateTable
CREATE TABLE "links" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(8) NOT NULL,
    "url" TEXT NOT NULL,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_clicked" TIMESTAMP(3),

    CONSTRAINT "links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "links_code_key" ON "links"("code");

-- CreateIndex
CREATE INDEX "links_code_idx" ON "links"("code");
