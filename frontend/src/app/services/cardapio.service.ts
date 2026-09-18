import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Cardapio {
  id_cardapio?: number;
  comida: string;
  fk_id_horario: number;

  id_horario?: number;
  hora?: number;
  dia?: string;
}

export interface RespostaCardapio {
  mensagem: string;
  id_cardapio?: number;
}

@Injectable({
  providedIn: 'root'
})
export class CardapioService {

  // URL da API
  private apiUrl = 'http://localhost:3000/cardapio';
  constructor(private http: HttpClient) { }

  buscarTodos(): Observable<Cardapio[]> {
    return this.http.get<Cardapio[]>(
      this.apiUrl
    );
  }


  buscarPorDia(dia: string): Observable<Cardapio[]> {
    return this.http.get<Cardapio[]>(
      `${this.apiUrl}/${dia}`
    );
  }

  buscarPorId(id: number): Observable<Cardapio> {

    return this.http.get<Cardapio>(
      `${this.apiUrl}/id/${id}`
    );
  }

  cadastrar(cardapio: Cardapio): Observable<RespostaCardapio> {

    return this.http.post<RespostaCardapio>(
      this.apiUrl,
      {
        comida: cardapio.comida,
        fk_id_horario: cardapio.fk_id_horario
      }
    );
  }

  atualizar(
    id: number,
    cardapio: Cardapio
  ): Observable<RespostaCardapio> {

    return this.http.put<RespostaCardapio>(
      `${this.apiUrl}/${id}`,
      {
        comida: cardapio.comida,
        fk_id_horario: cardapio.fk_id_horario
      }
    );

  }

  excluir(id: number): Observable<RespostaCardapio> {

    return this.http.delete<RespostaCardapio>(
      `${this.apiUrl}/${id}`
    );
  }
}