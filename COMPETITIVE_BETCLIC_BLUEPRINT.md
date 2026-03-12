# Blueprint "Concurrencer Betclic" + Recommandation IA

> Objectif: transformer ce POC en plateforme pari/sportbook production-grade, exhaustive sur les cas métier, techniques, réglementaires et opérationnels.

## 1) Cadrage produit (niveau Betclic)
- Multi-sports: foot, tennis, basket, rugby, esport, UFC/boxe.
- Multi-verticales: pre-match, live, combinés, cashout, bonus, freebets, paris système.
- Multi-surfaces: web responsive, apps iOS/Android, web mobile léger.
- Personnalisation native: homepage, marchés favoris, limites responsables dynamiques, recommandations explicables.

## 2) Domaines métier à couvrir (exhaustif)
1. **Catalogue événements**: ligues, compétitions, saisons, calendriers, reports/annulations.
2. **Trading/Odds**: pricing, margining, suspensions automatiques, re-pricing temps réel, hedge.
3. **Bets lifecycle**: création ticket, validation, acceptance, settlement, void, partial void.
4. **Compte joueur**: KYC/KYB, wallet, dépôts/retraits, limites, auto-exclusion.
5. **Promotions**: bonus d’inscription, boosts de cotes, missions, segmentation.
6. **Conformité**: RGPD, AML, anti-fraude, jeu responsable, régulateur (ANJ).
7. **Support/ops**: incidents, remboursements, litiges, monitoring SLA/SLO.

## 3) Cas extrêmes à prévoir absolument
- Match interrompu/abandonné, météo extrême, VAR tardive, correction score rétroactive.
- Markets suspendus en rafale pendant update feed.
- Latence fournisseur odds > 5s / out-of-order events.
- Tentatives de mise simultanées (double-click, race condition wallet).
- Changement de cote après affichage avant validation ticket.
- Erreurs PSP (paiement), retries idempotents, timeouts réseau.
- Pics de trafic (grands matchs), dégradations partielles.
- Session risque élevée + pattern de pertes (adaptation UX + garde-fous).

## 4) Architecture cible (haute pertinence)
- **BFF Front** (web/mobile), **API Gateway**, services domaine:
  - `events-service`, `odds-service`, `bet-service`, `wallet-service`, `promo-service`, `risk-service`, `recommendation-service`.
- Event streaming (Kafka/PubSub): changements cotes, statut market, settlement.
- Cache multi-niveaux (Redis/CDN), stockage transactionnel (PostgreSQL), analytique (BigQuery/Snowflake).
- Feature flags + experimentation platform (A/B, holdout).

## 5) Recommandation “niveau industriel”
- Ranking hybride:
  - règles métier (sûreté, conformité, eligibility),
  - modèle ML (propension, affinité marché),
  - reranking responsable (limites profil/session).
- Explainability obligatoire (tags + facteurs) pour éviter la boîte noire.
- Online learning contrôlé + garde-fous anti-surpersonnalisation.
- Cold-start: fallback par contexte live + popularité + préférences explicites.

## 6) Jeu responsable by design
- Score de risque session temps réel (durée, pertes, escalade mise, fréquence).
- Frictions adaptatives: pauses, plafonds, confirmations supplémentaires.
- Journaux d’audit pour décisions automatiques (traçabilité régulateur).
- UX dédiée: centre limites, historique, alertes compréhensibles.

## 7) Roadmap pragmatique (12 mois)
- **T1**: socle domaine + observabilité + flows pari robustes.
- **T2**: live trading solide + cashout + premières promos.
- **T3**: recommandation hybride + A/B testing + optimisation conversion.
- **T4**: extension multi-sports complète + excellence opérationnelle.

## 8) KPIs pour battre un acteur établi
- Conversion visiteur → parieur actif.
- GGR net / ARPU / rétention D7-D30.
- Taux d’erreur ticket, latence quote→bet accepted.
- Indicateurs jeu responsable (interventions, pauses, incidents).
- NPS UX live et taux d’usage recommandations.

## 9) Definition of Done (niveau “go-live régulé”)
- SLO tenus en production sur gros trafic.
- Zéro régression critique sur settlement/wallet.
- Audit conformité OK (ANJ/AML/RGPD).
- Kill-switches et plans de reprise testés.
- Documentation runbook + incident drills validés.
