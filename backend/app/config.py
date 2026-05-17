from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = "postgresql://app:app@db:5432/app"
    cors_origins: str = "http://localhost:3000"

    openai_api_key: str = ""
    openai_model: str = "gpt-5-nano"

    jwt_secret: str = "dev-secret-change-me"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24 * 7

    max_negotiation_rounds: int = 10
    extra_rounds_per_pack: int = 5
    price_extra_rounds_try: int = 29
    price_premium_individual_try: int = 149
    price_premium_business_try: int = 499

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=False)

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
