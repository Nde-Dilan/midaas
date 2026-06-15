# domain

Midaas domain models — GORM entities mapped to PostgreSQL.

## Tables

### users

| Column          | Type        | PK | Notes                         |
|-----------------|-------------|----|-------------------------------|
| id              | uuid        | *  | gen_random_uuid()             |
| email           | string      |    | unique, not null              |
| phone_number    | string      |    |                               |
| hash_password   | string      |    | not null, json hidden         |
| full_name       | string      |    | not null                      |
| id_card_url     | string      |    | object store URL              |
| id_card_number  | string      |    |                               |
| created_at      | timestamp   |    |                               |
| updated_at      | timestamp   |    |                               |
| deleted_at      | timestamp   |    | soft delete (indexed)         |

### entrepreneurs

| Column     | Type      | PK | Notes                            |
|------------|-----------|----|----------------------------------|
| id         | uuid      | *  | gen_random_uuid()                |
| user_id    | uuid      |    | FK -> users.id (unique, not null)|
| status     | string    |    | pending / active / rejected / suspended |
| created_at | timestamp |    |                                  |
| updated_at | timestamp |    |                                  |

### admins

| Column        | Type      | PK | Notes                            |
|---------------|-----------|----|----------------------------------|
| id            | uuid      | *  | gen_random_uuid()                |
| email         | string    |    | unique, not null                 |
| hash_password | string    |    | not null, json hidden            |
| full_name     | string    |    | not null                         |
| role          | string    |    | super_admin / moderator          |
| created_at    | timestamp |    |                                  |
| updated_at    | timestamp |    |                                  |
| deleted_at    | timestamp |    | soft delete (indexed)            |

### companies

| Column           | Type      | PK | Notes                                     |
|------------------|-----------|----|-------------------------------------------|
| id               | uuid      | *  | gen_random_uuid()                         |
| entrepreneur_id  | uuid      |    | FK -> entrepreneurs.id (not null, indexed)|
| status           | string    |    | draft / pending / approved / rejected     |
| legal_name       | string    |    | not null                                  |
| trade_name       | string    |    | DBA / brand name                          |
| corporate_form   | string    |    | ETS, SARL, SA, SAS                        |
| industry_sector  | string    |    |                                           |
| gps_coordinates  | string    |    |                                           |
| physical_address | text      |    |                                           |
| created_at       | timestamp |    |                                           |
| updated_at       | timestamp |    |                                           |
| deleted_at       | timestamp |    | soft delete (indexed)                     |

### company_legal_docs

| Column                | Type      | PK | Notes                                  |
|-----------------------|-----------|----|----------------------------------------|
| id                    | uuid      | *  | gen_random_uuid()                      |
| company_id            | uuid      |    | FK -> companies.id (unique, not null)  |
| rccm_number           | string    |    |                                        |
| rccm_expiry_date      | date?     |    | nullable                               |
| rccm_docs             | jsonb     |    | string[] — object URLs                 |
| niu_number            | string    |    |                                        |
| niu_doc_url           | string    |    | single object URL                      |
| statuts_docs          | jsonb     |    | string[] — object URLs                 |
| localisation_doc_url  | string    |    | single object URL                      |
| premises_photos       | jsonb     |    | string[] — object URLs                 |
| sector_permits        | jsonb     |    | string[] — object URLs                 |
| created_at            | timestamp |    |                                        |
| updated_at            | timestamp |    |                                        |

### company_financials

| Column              | Type      | PK | Notes                                  |
|---------------------|-----------|----|----------------------------------------|
| id                  | uuid      | *  | gen_random_uuid()                      |
| company_id          | uuid      |    | FK -> companies.id (unique, not null)  |
| dsf_years           | jsonb     |    | int[] — e.g. [2024, 2025]              |
| dsf_stamped_docs    | jsonb     |    | string[] — object URLs                 |
| anr_issue_date      | date?     |    | nullable                               |
| anr_expiry_date     | date?     |    | nullable, flag if > 3 months old       |
| anr_doc_url         | string    |    | single object URL                      |
| cnps_clearance_url  | string    |    | single object URL                      |
| bank_statements     | jsonb     |    | string[] — object URLs                 |
| momo_statements     | jsonb     |    | string[] — object URLs                 |
| created_at          | timestamp |    |                                        |
| updated_at          | timestamp |    |                                        |

### beneficial_owners

| Column            | Type      | PK | Notes                                  |
|-------------------|-----------|----|----------------------------------------|
| id                | uuid      | *  | gen_random_uuid()                      |
| company_id        | uuid      |    | FK -> companies.id (indexed, not null) |
| full_name         | string    |    | not null                               |
| equity_percentage | float64   |    |                                        |
| identity_docs     | jsonb     |    | string[] — object URLs                 |
| created_at        | timestamp |    |                                        |
| updated_at        | timestamp |    |                                        |

### company_managers

| Column                 | Type      | PK | Notes                                  |
|------------------------|-----------|----|----------------------------------------|
| id                     | uuid      | *  | gen_random_uuid()                      |
| company_id             | uuid      |    | FK -> companies.id (indexed, not null) |
| full_name              | string    |    | not null                               |
| role                   | string    |    | e.g. Gerant, Directeur General         |
| identity_docs          | jsonb     |    | string[] — object URLs                 |
| casier_judiciaire_url  | string    |    | single object URL                      |
| casier_judiciaire_date | date?     |    | nullable, must be < 3 months old       |
| cv_url                 | string    |    | single object URL                      |
| created_at             | timestamp |    |                                        |
| updated_at             | timestamp |    |                                        |

### company_operations

| Column                    | Type      | PK | Notes                                  |
|---------------------------|-----------|----|----------------------------------------|
| id                        | uuid      | *  | gen_random_uuid()                      |
| company_id                | uuid      |    | FK -> companies.id (unique, not null)  |
| top_suppliers             | jsonb     |    | JSON object                            |
| top_clients               | jsonb     |    | JSON object                            |
| collateral_type           | string    |    |                                        |
| collateral_proof_docs     | jsonb     |    | string[] — object URLs                 |
| continuity_infrastructure | text      |    |                                        |
| created_at                | timestamp |    |                                        |
| updated_at                | timestamp |    |                                        |

### projects

| Column           | Type      | PK | Notes                                           |
|------------------|-----------|----|--------------------------------------------------|
| id               | uuid      | *  | gen_random_uuid()                               |
| company_id       | uuid      |    | FK -> companies.id (indexed, not null)           |
| entrepreneur_id  | uuid      |    | FK -> entrepreneurs.id (indexed, not null)       |
| title            | string    |    | not null                                         |
| description      | text      |    |                                                  |
| funding_goal     | float64   |    | not null                                         |
| funding_raised   | float64   |    | default 0                                        |
| currency         | string    |    | XOF, XAF, etc.                                   |
| status           | string    |    | draft / pending / active / funded / complete / blocked / rejected |
| category         | string    |    |                                                  |
| cover_image_url  | string    |    | object store URL                                 |
| start_date       | date?     |    | nullable                                         |
| end_date         | date?     |    | nullable                                         |
| created_at       | timestamp |    |                                                  |
| updated_at       | timestamp |    |                                                  |

### milestones

| Column           | Type      | PK | Notes                                        |
|------------------|-----------|----|-----------------------------------------------|
| id               | uuid      | *  | gen_random_uuid()                            |
| project_id       | uuid      |    | FK -> projects.id (indexed, not null)         |
| title            | string    |    | not null                                      |
| description      | text      |    |                                               |
| order_num        | int       |    | not null, sequence                            |
| fund_allocation  | float64   |    | not null, amount for this milestone           |
| status           | string    |    | pending / active / under_review / approved / rejected / paid |
| due_date         | date?     |    | nullable                                      |
| proof_docs       | jsonb     |    | string[] — achievement proof URLs             |
| proof_notes      | text      |    | entrepreneur notes                            |
| admin_feedback   | text      |    | rejection reason                              |
| reviewed_by      | uuid?     |    | admin FK, nullable                            |
| reviewed_at      | timestamp?|    | nullable                                      |
| paid_at          | timestamp?|    | nullable, set on payout                       |
| created_at       | timestamp |    |                                               |
| updated_at       | timestamp |    |                                               |

### investments

| Column           | Type      | PK | Notes                                        |
|------------------|-----------|----|-----------------------------------------------|
| id               | uuid      | *  | gen_random_uuid()                            |
| project_id       | uuid      |    | FK -> projects.id (indexed, not null)         |
| user_id          | uuid      |    | FK -> users.id (indexed, not null)            |
| amount           | float64   |    | not null                                      |
| currency         | string    |    | not null                                      |
| ownership_pct    | float64   |    | % of project owned                            |
| status           | string    |    | pending / confirmed / failed / refunded       |
| transaction_ref  | string    |    | PawaPay gateway reference                     |
| created_at       | timestamp |    |                                               |
| updated_at       | timestamp |    |                                               |

### transactions

| Column        | Type      | PK | Notes                                          |
|---------------|-----------|----|-------------------------------------------------|
| id            | uuid      | *  | gen_random_uuid()                              |
| user_id       | uuid      |    | FK -> users.id (indexed, not null)              |
| investment_id | uuid?     |    | FK -> investments.id (indexed, nullable)        |
| type          | string    |    | investment / milestone_payout / refund          |
| amount        | float64   |    | not null                                        |
| currency      | string    |    | not null                                        |
| direction     | string    |    | debit / credit                                  |
| status        | string    |    | pending / completed / failed                    |
| gateway_ref   | string    |    | PawaPay reference                               |
| description   | string    |    |                                                 |
| created_at    | timestamp |    |                                                 |

## Relations

```
User 1---1 Entrepreneur
Entrepreneur 1---* Company
Entrepreneur 1---* Project
Company 1---1 CompanyLegalDocs
Company 1---1 CompanyFinancials
Company 1---1 CompanyOperations
Company 1---* BeneficialOwner
Company 1---* CompanyManager
Company 1---* Project
Project 1---* Milestone
Project 1---* Investment
User 1---* Investment
User 1---* Transaction
Investment 1---* Transaction
```

## Computed Types

**Portfolio** — aggregated from Investments + Projects, no DB table.
**InvestmentDetail** — per-project summary within the portfolio view.

## Conventions

- `jsonb` columns hold `[]string` (object URLs) or `[]int`.
- `date?` columns use `*time.Time` — nullable.
- `uuid?` columns use `*uuid.UUID` — nullable.
- Soft deletes on `users`, `companies`, `admins` only.
- All PKs are UUID v4 via `gen_random_uuid()`.
- JSON fields use `gorm.io/datatypes.JSON`.
