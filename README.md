# FindDoc API

API Node.js/Express pour la gestion de signalements de documents perdus/trouvés, avec authentification, validation, notifications et matching automatique.

## Fonctionnalités principales
- Authentification (inscription, login, OTP)
- Signalement de documents perdus/trouvés
- Matching automatique entre objets perdus et trouvés
- Validation des données avec Zod
- Notifications par email (Resend)
- Utilisation de Prisma ORM (MySQL)

## Prérequis
- Node.js >= 16
- npm
- Base de données MySQL

## Installation
1. **Cloner le repo**
   ```bash
   git clone <repo-url>
   cd findDoc-api
   ```
2. **Installer les dépendances**
   ```bash
   npm install
   ```
3. **Configurer les variables d'environnement**
   - Copier `.env.example` en `.env` et remplir les valeurs nécessaires :
     - `DATABASE_URL` (connexion MySQL)
     - `RESEND_API_KEY` (clé API Resend)
     - `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`

4. **Générer le client Prisma**
   ```bash
   npx prisma generate
   ```
5. **Appliquer les migrations (si besoin)**
   ```bash
   npx prisma migrate dev
   ```

## Lancer le projet
En mode développement (TypeScript, hot reload) :
```bash
npm run dev
```

L'API sera disponible sur `http://localhost:3000` (ou le port défini dans votre app).

## Tester les endpoints
Utilisez Postman, Insomnia ou `curl` pour tester les routes principales :

### Authentification
- **Inscription** :
  - `POST /api/auth/signup`
  - Body : `{ "email": "...", "password": "...", "lastName": "..." }`
- **Vérification OTP** :
  - `POST /api/auth/verify-otp`
  - Body : `{ "email": "...", "otpCode": "..." }`
- **Login** :
  - `POST /api/auth/login`
  - Body : `{ "email": "...", "password": "..." }`

### Signalements
- **Créer un signalement perdu** :
  - `POST /api/reports/lost`
  - Header : `Authorization: Bearer <token>`
  - Body : `{ "category": "CNI", "lat": 0, "lng": 0, "data": { ... } }`
- **Créer un signalement trouvé** :
  - `POST /api/reports/found`
  - Header : `Authorization: Bearer <token>`
  - Body : `{ "category": "CNI", "lat": 0, "lng": 0, "data": { ... } }`

## Astuces développement
- Pour voir la base : `npx prisma studio`
- Pour relancer Prisma après modif du schéma : `npx prisma generate`

## Structure du projet
- `src/api/` : routes et contrôleurs Express
- `src/services/` : logique métier
- `prisma/` : schéma et migrations Prisma

---

**Auteur** : [@Dev_Rnam] 