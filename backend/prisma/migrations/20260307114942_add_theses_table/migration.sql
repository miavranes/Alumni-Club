-- CreateTable
CREATE TABLE "theses" (
    "id" SERIAL NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "type" VARCHAR(100) NOT NULL,
    "file_url" VARCHAR(255) NOT NULL,
    "year" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "theses_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "theses" ADD CONSTRAINT "theses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
