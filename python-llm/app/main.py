import sys
from dotenv import load_dotenv
from fastapi import FastAPI
from pydantic import BaseModel
from services.llm_service import LLMService

load_dotenv()
sys.path = sys.path + ["./app"]

app = FastAPI()
llm_service = LLMService()

class TextData(BaseModel):
    text: str
    lang: str

def lingua(lang: str) -> str:
        # Não encontrei uma maneira de alterar o idioma do modelo, então fiz um switch case
            match lang:
                case 'pt':
                    language = 'Resuma, em português, o seguinte texto: '
                case 'en':
                    language = 'Resuma, em inglês, o seguinte texto: '
                case 'es':
                    language = 'Resuma, em espanhol, o seguinte texto: '
                case _:
                    language = 'Resuma, em português, o seguinte texto: '
            return language

@app.post("/summarize")
async def summarize(data: TextData):
    texto = data.text
    lang = lingua(data.lang)
    text = lang + texto
    llm_service.summarize_text(text, lang)
    return "OK"
