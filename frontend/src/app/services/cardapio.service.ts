import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


// =====================================================
// INTERFACE DOS DADOS DO CARDÁPIO
// =====================================================

export interface ItemCardapio {
  id_cardapio?: number;
  comida: string;
  fk_id_horario: number;

  // Dados da tabela Horario
  id_horario?: number;
  hora?: number;
  dia?: string;
}


// =====================================================
// RESPOSTA DA API
// =====================================================

export interface RespostaCardapio {
  mensagem: string;
  id_cardapio?: number;
}


// =====================================================
// SERVICE
// =====================================================

@Injectable({
  providedIn: 'root'
})
export class CardapioService {

  private apiUrl = 'http://localhost:3000/cardapio';


  // ===================================================
  // CONSTRUTOR
  // ===================================================

  constructor(
    private http: HttpClient
  ) {}


  // ===================================================
  // GET - BUSCAR TODO O CARDÁPIO
  // ===================================================

  buscarTodos(): Observable<ItemCardapio[]> {

    return this.http.get<ItemCardapio[]>(
      this.apiUrl
    );

  }


  // ===================================================
  // GET - BUSCAR POR DIA
  // ===================================================

  buscarPorDia(
    dia: string
  ): Observable<ItemCardapio[]> {

    return this.http.get<ItemCardapio[]>(
      `${this.apiUrl}/${dia}`
    );

  }


  // ===================================================
  // GET - BUSCAR POR ID
  // ===================================================

  buscarPorId(
    id: number
  ): Observable<ItemCardapio> {

    return this.http.get<ItemCardapio>(
      `${this.apiUrl}/id/${id}`
    );

  }


  // ===================================================
  // POST - CADASTRAR
  // ===================================================

  cadastrar(
    cardapio: ItemCardapio
  ): Observable<RespostaCardapio> {

    return this.http.post<RespostaCardapio>(
      this.apiUrl,
      {
        comida: cardapio.comida,
        fk_id_horario: cardapio.fk_id_horario
      }
    );

  }


  // ===================================================
  // PUT - ATUALIZAR
  // ===================================================

  atualizar(
    id: number,
    cardapio: ItemCardapio
  ): Observable<RespostaCardapio> {

    return this.http.put<RespostaCardapio>(
      `${this.apiUrl}/${id}`,
      {
        comida: cardapio.comida,
        fk_id_horario: cardapio.fk_id_horario
      }
    );

  }


  // ===================================================
  // DELETE - EXCLUIR
  // ===================================================

  excluir(
    id: number
  ): Observable<RespostaCardapio> {

    return this.http.delete<RespostaCardapio>(
      `${this.apiUrl}/${id}`
    );

  }

}