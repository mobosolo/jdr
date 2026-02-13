
  # High-Fidelity Web Design

  This is a code bundle for High-Fidelity Web Design. The original project is available at https://www.figma.com/design/Wb0ipDdOjIgmk6csY18Bhq/High-Fidelity-Web-Design.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.
  

## pour la base de donnee
1- npm install prisma tsx @types/pg --save-dev
2- npm install @prisma/client @prisma/adapter-pg dotenv pg
3- creer une base de données postgres du nom de jdr
4- creer un fichier .env et mettez : DATABASE_URL="postgresql://johndoe:randompassword@localhost:5432/statAi?schema=public"
en remplacant johndoe->par le nom de votre server; randompassword->par le mot de passe.
s'il y'a une erreur verifier que le nom statAi est bien celui que vous avez mis pour la base de donne
5- npx prisma migrate
6- npx prisma generate
7- npx tsx script.ts
8- npx prisma studio (pour visualiser la base)
9- npm install cors
10- npm install express



  **pour lancer le server:
  _ npx tsx routes/server.ts