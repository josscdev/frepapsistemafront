import * as signalR from '@microsoft/signalr';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import Swal from 'sweetalert2';


@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private hubConnection!: signalR.HubConnection;

  constructor() {}

  public startConnection(): void {
    this.hubConnection = new signalR.HubConnectionBuilder()
      // .withUrl('https://localhost:7169/hubs/notifications') // Cambiar a prod si hace falta
      .withUrl('https://intranet.grupotawa.com/RomBIBack/hubs/notifications') // Cambiar a prod si hace falta
      .withAutomaticReconnect()
      .build();

    this.hubConnection
      .start()
      .then(() => console.log('✅ Conectado a SignalR'))
      .catch((err) => console.error('❌ Error al conectar SignalR:', err));

    // Escuchar notificaciones desde el backend
    this.hubConnection.on('ReceiveNotification', (user: string, message: string) => {
      //this.mostrarToast(`${user}: ${message}`);
    });
  }

  private mostrarToast(texto: string) {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'info',
      title: texto,
      showConfirmButton: false,
      timer: 4000,
      timerProgressBar: true,
      background: '#f0f0f0',
      color: '#333',
    });
  }
}