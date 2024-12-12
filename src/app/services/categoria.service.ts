import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface Categoria {
  idCategoria?: number;
  nombre: string;
  estado?: string; // Add estado field to match backend
}

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {
  private apiUrl = 'https://organic-space-potato-g4q76jqpj5vg2p64v-8081.app.github.dev/machabarberia/api/categorias'; // URL base de la API

  constructor(private http: HttpClient) { }

  // Obtener todas las categorías
  getAllCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(this.apiUrl);
  }

  // Crear una nueva categoría
  createCategoria(categoria: Categoria): Observable<Categoria> {
    return this.http.post<Categoria>(this.apiUrl, categoria);
  }

  // Actualizar una categoría existente
  updateCategoria(id: number, categoria: Categoria): Observable<Categoria> {
    return this.http.put<Categoria>(`${this.apiUrl}/${id}`, categoria);
  }

  // Eliminar una categoría
  deleteCategoria(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Restaurar una categoría
  restoreCategoria(id: number): Observable<Categoria> {
    return this.http.put<Categoria>(`${this.apiUrl}/restaurar/${id}`, {});
  }

  // Obtener categorías por estado
  getCategoriasByEstado(estado: string): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.apiUrl}/estado/${estado}`);
  }

  // Verificar si un nombre de categoría ya existe
  checkNombreExists(nombre: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/check-nombre/${nombre}`);
  }
}