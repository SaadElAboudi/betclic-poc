# Backlog d’exécution — Vers une plateforme type Betclic + Recommandation

## A. Produit & Expérience utilisateur
- [ ] Navigation complète sportsbook (Accueil, Live, Sports, Compétitions, Paris sportifs)
- [ ] Pages compétition / équipe / rencontre avec filtres persistants
- [ ] Fiche match enrichie (timeline, incidents, compos, H2H)
- [ ] Bet slip multi-types (simple, combiné, système) + validation cote évolutive
- [ ] Cashout (partiel/total) + historique instantané
- [ ] Bonus/promotions (freebets, boosts, missions)
- [ ] Personnalisation homepage (marchés favoris, équipes suivies)
- [ ] Recommandations explicables (raison + score + contexte)

## B. Moteur de recommandation (IA + règles)
- [ ] API de configuration runtime (mode prudence, volume de recos, filtres marchés)
- [ ] Règles de sûreté métier (éligibilité marchés / exclusions)
- [ ] Reranking responsable (selon niveau de risque)
- [ ] Feature flags et experimentation A/B
- [ ] Tracking complet impression/click/add-to-slip/place-bet
- [ ] Monitoring qualité (CTR, conversion, calibration, diversité)

## C. Trading / Odds / Lifecycle de pari
- [ ] Ingestion providers odds (stream + fallback)
- [ ] Suspensions auto par événements critiques
- [ ] Repricing et propagation faible latence
- [ ] Ticket lifecycle complet (accepted/rejected/void/settled)
- [ ] Gestion des erreurs de changement de cote en validation

## D. Paiements / Wallet / Compte
- [ ] Wallet ledger fiable (idempotence, doubles écritures)
- [ ] Dépôts/retraits PSP multiples + retries robustes
- [ ] KYC / limites compte / auto-exclusion
- [ ] Journalisation antifraude et règles AML

## E. Conformité & Jeu Responsable
- [ ] Limites dépôt/mise/perte paramétrables
- [ ] Détection sessions à risque (temps réel)
- [ ] Frictions graduelles (pause, plafonds, confirmations)
- [ ] Audit trail complet des décisions automatiques
- [ ] Parcours RGPD (consentement, export, suppression)

## F. Plateforme & Qualité
- [ ] Architecture service-based (events, odds, bet, wallet, recos, risk)
- [ ] Event bus + cache multi-niveaux
- [ ] Observabilité (logs, traces, métriques, SLO)
- [ ] Résilience (circuit breakers, fallbacks, chaos drills)
- [ ] CI/CD quality gates (tests, sécurité, perf)

## G. Plan de livraison recommandé
### Phase 1 (0-6 semaines)
- [ ] Stabiliser API recommandations configurable
- [ ] Uniformiser contrat frontend/backend
- [ ] Ajouter instrumentation analytics de base
- [ ] Reprendre UX du bet slip et flux place bet

### Phase 2 (6-12 semaines)
- [ ] Trading live robuste + suspension/reprise marchés
- [ ] Ticket lifecycle complet + historique
- [ ] Expérimentation recommandations (A/B)

### Phase 3 (12+ semaines)
- [ ] Extension multi-sports complète
- [ ] Promo engine + segmentation avancée
- [ ] SRE hardening / conformité pré-audit
