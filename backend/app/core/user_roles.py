from enum import Enum

class UserRole(str, Enum):
    SUPER_ADMIN = "SUPER_ADMIN"
    ADMIN = "ADMIN"
    TEAM_WORKER = "TEAM_WORKER"
    VERIFIED_USER = "VERIFIED_USER" # Can be Lender or Borrower depending on context or sub-roles
    USER = "USER" # Unverified
