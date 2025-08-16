import { Component, ViewChild, AfterViewInit, ElementRef, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { AngularSignaturePadModule, NgSignaturePadOptions, SignaturePadComponent } from '@almothafar/angular-signature-pad';
import { CommonModule, DatePipe } from '@angular/common';
import { ValidacionBundleROMWEB } from '../../../../models/ROM/entel/validacion-bundles/validacionbundle';
import Swal from 'sweetalert2';
import { ActivatedRoute } from '@angular/router';


//IMPORTACIONES PARA HTML CANVAS
import jspdf, { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { HttpClient } from '@angular/common/http';

//IMPORTACIONES PDFMAKER
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { ValidacionBundlesRWService } from '../../../../services/ROM/entel/validacion-bundles/validacion-bundles-rw.service';

//NO BORRAR, esto llama los estilos de letra de pdfmake, sino no genera el pdf
//SI LO BORRAS, no genera pdf pero si se guarda en la bd
pdfMake.fonts = {
  Roboto: {
    normal: 'Roboto-Regular.ttf',
    bold: 'Roboto-Medium.ttf',
    italics: 'Roboto-Italic.ttf',
    bolditalics: 'Roboto-MediumItalic.ttf'
  }
};

@Component({
  selector: 'app-firma-bundle',
  standalone: true,
  imports: [
    FormsModule,
    AngularSignaturePadModule,
    CommonModule,
    ReactiveFormsModule
  ],
  providers: [
    DatePipe
  ],
  templateUrl: './firma-bundle.component.html',
  styleUrl: './firma-bundle.component.css'
})
export class FirmaBundleComponent implements OnInit, AfterViewInit {

  
  @ViewChild('signature') signaturePad?: SignaturePadComponent;

  signaturePadOptions: NgSignaturePadOptions = { // passed through to szimek/signature_pad constructor
    minWidth: 1,
    canvasWidth: 0,
    canvasHeight: 0,
    'backgroundColor': 'rgb(222, 224, 226)',
  };

  bundleForm: UntypedFormGroup;
  validacionBundle: ValidacionBundleROMWEB = new ValidacionBundleROMWEB();
  intidventasprincipal: number = 0;

  id?: number;

  firmaBase64: string = ''; // Variable para almacenar la firma en Base64

  nameCodigo: string = '';

  nombrePdfFirma: string = '';

  isValidated = false; //Para mostrar los demás campos luego de validar código

  isKeyIn = false; //Para bloquear input del codigo de autenticacion

  isShow = true; //Para desaparecer todo

  esObsequio = false; //Para el input obsequio

  @ViewChild('staticBackdrop') modal!: ElementRef;

  logoBase64: string = '';

  constructor(
    private route: ActivatedRoute,
    private fb: UntypedFormBuilder,
    private validacionBundlesService: ValidacionBundlesRWService,
    private http: HttpClient,
    private datePipe: DatePipe
  ) {
    this.bundleForm = this.createFormBundle();

    // Asignar vfs desde pdfFonts
    Object.assign(pdfMake, { vfs: pdfFonts.pdfMake.vfs });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.id = +params['id']; // Obtén el parámetro 'id' de la URL y conviértelo a número
      this.getDataById(this.id); // Llama al método para obtener los datos por ID
    });
  }

  ngAfterViewInit() {
    // this.setCanvasWidth();
    console.log('MODAL', this.modal);
    // this.signaturePad is now available
    this.signaturePad?.set('minWidth', 1); // set szimek/signature_pad options at runtime
    this.signaturePad?.clear(); // invoke functions from szimek/signature_pad API
    this.resizeSignaturePad()

  }



  loadImage(imagePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.http.get(imagePath, { responseType: 'blob' }).subscribe(blob => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          console.log(`Image in Base64 (${imagePath}):`, base64String);
          resolve(base64String);
        };
        reader.onerror = error => {
          console.error('Error reading image:', error);
          reject(error);
        };
        reader.readAsDataURL(blob);
      }, error => {
        console.error('Error loading image:', error);
        reject(error);
      });
    });
  }

  // async generarPDF(callback: () => void) {
  //   // Show the loading alert
  //   Swal.fire({
  //     title: 'Descargando Comprobante de Entrega de Premio',
  //     text: 'Por favor, espere mientras se descarga el PDF.',
  //     allowOutsideClick: false,
  //     showConfirmButton: false,
  //     willOpen: () => {
  //       Swal.showLoading();
  //     }
  //   });

  //   try {
  //     const logoBase64 = await this.loadImage('assets/img/logo_header_pdf.png');
  //     this.logoBase64 = logoBase64;

  //     const documentDefinition = this.getDocumentDefinition();

  //     //intventasromid_intidventasprincipal_intbundleid_strdnicliente_dtevestasromfeope_fechacreacion

  //     const fechaVentaFormateada = this.datePipe.transform(this.validacionBundle.strdtevestasromfeope, 'ddMMyyyy');
  //     const fechaCreacionFormateada = this.datePipe.transform(this.validacionBundle.dteventasromfecre, 'ddMMyyyy');

  //     let nameFile: string = this.validacionBundle.intventasromid?.toString() + '_'
  //       + this.validacionBundle.intidventasprincipal?.toString() + '_'
  //       + this.validacionBundle.intbundleid?.toString() + '_'
  //       + this.validacionBundle.strdnicliente + '_'
  //       + fechaVentaFormateada + '_'
  //       + fechaCreacionFormateada;

  //     pdfMake.createPdf(documentDefinition).getBlob(async (pdfBlob: any) => {
  //       // Crear un FormData para enviar el archivo al servidor
  //       const formData = new FormData();
  //       formData.append('pdf', pdfBlob, nameFile + '.pdf');

  //       this.validacionBundlesService.uploadPDF(formData).subscribe(
  //         (response: any) => {
  //           const pdfUrl = response.url;
  //           console.log('URL del PDF:', pdfUrl);

  //           if (response && response.pdfBase64) {

  //             // Decode the base64 PDF
  //             const fileName = response.url.substring(response.url.lastIndexOf('/') + 1);
  //             const nombre = response.nombrepdf;
  //             console.log('nombreeeeeee', nombre);
  //             this.validacionBundle.nombrepdffirma = nombre;
  //             const binaryString = window.atob(response.pdfBase64);
  //             const binaryLength = binaryString.length;
  //             const bytes = new Uint8Array(binaryLength);
  //             for (let i = 0; i < binaryLength; i++) {
  //               bytes[i] = binaryString.charCodeAt(i);
  //             }
  //             const pdfBlob = new Blob([bytes], { type: 'application/pdf' });

  //             // Create a download link for the PDF
  //             const downloadLink = document.createElement('a');
  //             downloadLink.href = URL.createObjectURL(pdfBlob);
  //             downloadLink.download = nombre; // Suggested name for the downloaded file

  //             // Append link, trigger click, and remove the link
  //             document.body.appendChild(downloadLink);
  //             downloadLink.click();
  //             document.body.removeChild(downloadLink);

  //             // Close the alert after the PDF is downloaded
  //             Swal.close();

  //             // Llama a la función de devolución de llamada aquí
  //             callback();

  //           } else {
  //             console.error('No se recibió un PDF válido del servidor.');
  //             Swal.fire({
  //               icon: 'error',
  //               title: 'Error',
  //               text: 'No se recibió un PDF válido del servidor.'
  //             });
  //           }
  //         },
  //         (error) => {
  //           console.error('Error al cargar el archivo PDF:', error);
  //           Swal.fire({
  //             icon: 'error',
  //             title: 'Error',
  //             text: 'Error al cargar el archivo PDF.'
  //           });
  //         }
  //       );

  //     });
  //   } catch (error) {
  //     console.error('Error generating PDF:', error);
  //   }
  // }


  //-------------------

  getBundleForm() {
    //Utilizando callbacks para ejecutar un metodo antes que otro
    this.guardarBundle(() => {
      //this.enviarNotificacion();
      //this.enviarNotificacion();
    });
  }

  async guardarBundle(callback: () => void) {
    //intbundleid 137 es el id de Obsequio, esta en duro 
    if (this.validacionBundle.intbundleid === 137 &&
      (this.bundleForm.get('nombreobsequio')?.value === ''
        || this.bundleForm.get('nombreobsequio')?.value === null)) {
      const Toast = Swal.mixin({
        toast: true,
        position: "bottom-end",
        showConfirmButton: false,
        timer: 4000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.onmouseenter = Swal.stopTimer;
          toast.onmouseleave = Swal.resumeTimer;
        }
      });
      Toast.fire({
        icon: "warning",
        showCloseButton: true,
        title: "El campo nombre obsequio debe ser llenado"
      });
      return;
    }

    if (this.firmaBase64 === '' || this.firmaBase64 === null) {
      const Toast = Swal.mixin({
        toast: true,
        position: "bottom-end",
        showConfirmButton: false,
        timer: 4000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.onmouseenter = Swal.stopTimer;
          toast.onmouseleave = Swal.resumeTimer;
        }
      });
      Toast.fire({
        icon: "warning",
        showCloseButton: true,
        title: "Debe firmar!"
      });
      return;
    }

    this.validacionBundle.nombreobsequio = this.bundleForm.get('nombreobsequio')?.value.toUpperCase();
    this.validacionBundle.usuario_creacion = this.validacionBundle.dnipromotor;

    const Toast = Swal.mixin({
      toast: true,
      position: "bottom-end",
      showConfirmButton: false,
      timer: 4000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
      }
    });
    Toast.fire({
      icon: "info",
      title: "Procesando Datos"
    });

    // // Formatear las fechas
    // const fechaVentaFormateada = this.datePipe.transform(this.validacionBundle.strdtevestasromfeope, 'ddMMyyyy');
    // const fechaCreacionFormateada = this.datePipe.transform(this.validacionBundle.dteventasromfecre, 'ddMMyyyy');

    // let nameFile: string = this.validacionBundle.intventasromid?.toString() + '_'
    //   + this.validacionBundle.intidventasprincipal?.toString() + '_'
    //   + this.validacionBundle.intbundleid?.toString() + '_'
    //   + this.validacionBundle.strdnicliente + '_'
    //   + fechaVentaFormateada + '_'
    //   + fechaCreacionFormateada;

    // this.validacionBundle.nombrepdffirma = nameFile;

    this.validacionBundlesService.postBundlesFirma(this.validacionBundle).subscribe(async res => {
      console.log('1', res)
      if (res.mensaje === 'OK') {

        // Show the loading alert
        Swal.fire({
          title: 'Descargando Comprobante de Entrega de Premio',
          text: 'Por favor, espere mientras se descarga el PDF.',
          allowOutsideClick: false,
          showConfirmButton: false,
          willOpen: () => {
            Swal.showLoading();
          }
        });

        console.log('2', res)

        this.nameCodigo = res.codigo;
        this.nombrePdfFirma = res.nombrepdffirma;

        try {
          console.log('3: try', res)

          await this.procesarPDF(this.nombrePdfFirma);
          // Close the alert after the PDF is downloaded
          Swal.close();

          this.isShow = false;

          // Llama a la función de devolución de llamada aquí
          callback();
        } catch (error) {
          console.log('Entrando al Catch , linea 349');

          console.error('Error generating PDF:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error al generar el PDF.'
          });
        }
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: res.mensaje
        });
      }
    });
  }

  private async procesarPDF(nameFile: string) {
    console.log('4')
    const logoBase64 = await this.loadImage('assets/img/logo_header_pdf.png');
    this.logoBase64 = logoBase64;

    const documentDefinition = this.getDocumentDefinition();

    return new Promise<void>((resolve, reject) => {
      console.log('5')
      pdfMake.createPdf(documentDefinition).getBlob(async (pdfBlob: any) => {
        try {
          const formData = new FormData();
          formData.append('pdf', pdfBlob, nameFile + '.pdf');

          this.validacionBundlesService.uploadPDF(formData).subscribe(
            async (response: any) => {
              if (response.status !== 'OK' || response.status === undefined || response.status === null) {
                console.log('NO SE SUBIÓ el PDF', response.status);
              } else if (response.status === 'OK') {
                if (response && response.pdfBase64) {
                  console.log('SE SUBIÓ el PDF', response.status)
                  // Aseguramos que validarSubidaS3 se ejecute antes de continuar
                  try {
                    const res = await this.validacionBundlesService.validarSubidaS3(this.validacionBundle.intventasromid ?? 0).toPromise();
                    console.log('RESPUESTA: ', res.mensaje);
                  } catch (error) {
                    console.error('Error en validarSubidaS3:', error);
                    reject('Error en validarSubidaS3');
                    return;
                  }
                  const fileName = response.url.substring(response.url.lastIndexOf('/') + 1);
                  const nombre = response.nombrepdf;
                  const binaryString = window.atob(response.pdfBase64);
                  const binaryLength = binaryString.length;
                  const bytes = new Uint8Array(binaryLength);
                  for (let i = 0; i < binaryLength; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                  }
                  const pdfBlob = new Blob([bytes], { type: 'application/pdf' });

                  const downloadLink = document.createElement('a');
                  downloadLink.href = URL.createObjectURL(pdfBlob);
                  downloadLink.download = nombre;

                  document.body.appendChild(downloadLink);
                  downloadLink.click();
                  document.body.removeChild(downloadLink);

                  console.log('SE DESCARGÓ el PDF')

                  resolve();
                } else {
                  console.error('No se recibió un PDF válido del servidor.');
                  Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se recibió un PDF válido del servidor.'
                  });
                  reject('Invalid PDF response');
                }
              }
            },
            (error) => {
              console.error('Error al cargar el archivo PDF:', error);
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al cargar el archivo PDF.'
              });
              reject('Error uploading PDF');
            }
          );
        } catch (error) {
          reject(error);
        }
      });
    });
  }



  getDocumentDefinition(): any {
    // Luego, en el método donde creas el objeto PDF, formatea la fecha de venta
    const fechaVentaFormateada = this.datePipe.transform(this.validacionBundle.strdtevestasromfeope, 'dd/MM/yyyy');

    let nombre: string = '';
    nombre = this.validacionBundle.nombreobsequio ?? '';
    let nombrePremio: string = nombre || '-';
    return {
      content: [
        {
          image: 'logo_header',
          width: 520
        },
        { text: 'Código: ' + this.nameCodigo, style: 'headerTable' },
        { text: 'Validación de Entrega de Bundles', style: 'header' },
        { text: 'Estimado Cliente', style: 'paragraph' },
        { text: 'Agradecemos su preferencia con el siguiente premio: ' + this.validacionBundle.descripcion, style: 'paragraph' },
        { text: 'Muchas Gracias por su compra.', style: 'paragraph' },
        { text: 'Datos Cliente', style: 'headerTable' },
        {
          //layout: 'lightHorizontalLines', // optional
          table: {
            // headers are automatically repeated if the table spans over multiple pages
            // you can declare how many rows should be treated as headers
            headerRows: 0,
            widths: ['*', '*'],

            body: [
              [{ text: 'DNI Cliente:', bold: true }, this.validacionBundle.strdnicliente],
              [{ text: 'N° Celular de Contrato:', bold: true }, this.validacionBundle.strcelularcontrato],
            ],
            // Grosor y color de las líneas de la tabla
            layout: {
              hLineWidth: function (i: any, node: any) {
                return 1; // Grosor de las líneas horizontales
              },
              vLineWidth: function (i: any, node: any) {
                return 1; // Grosor de las líneas verticales
              },
              hLineColor: function (i: any, node: any) {
                return '#000000'; // Color de las líneas horizontales
              },
              vLineColor: function (i: any, node: any) {
                return '#000000'; // Color de las líneas verticales
              }
            }
          }
        },
        { text: 'Datos de la Venta', style: 'headerTable' },
        {
          //layout: 'lightHorizontalLines', // optional
          table: {
            // headers are automatically repeated if the table spans over multiple pages
            // you can declare how many rows should be treated as headers
            headerRows: 0,
            widths: ['*', '*'],

            body: [
              [{ text: 'Fecha de Venta:', bold: true }, fechaVentaFormateada],
              [{ text: 'Nombre Promotor:', bold: true }, this.validacionBundle.nombrepromotor],
              [{ text: 'DNI Promotor:', bold: true }, this.validacionBundle.dnipromotor],
              [{ text: 'Punto de Venta:', bold: true }, this.validacionBundle.puntoventa],
              [{ text: 'Producto:', bold: true }, this.validacionBundle.strproductodesc],
              [{ text: 'N° Orden:', bold: true }, this.validacionBundle.strnumorden]
            ],
            // Grosor y color de las líneas de la tabla
            layout: {
              hLineWidth: function (i: any, node: any) {
                return 1; // Grosor de las líneas horizontales
              },
              vLineWidth: function (i: any, node: any) {
                return 1; // Grosor de las líneas verticales
              },
              hLineColor: function (i: any, node: any) {
                return '#000000'; // Color de las líneas horizontales
              },
              vLineColor: function (i: any, node: any) {
                return '#000000'; // Color de las líneas verticales
              }
            }
          }
        },
        { text: 'Datos Premio', style: 'headerTable' },
        {
          //layout: 'lightHorizontalLines', // optional
          table: {
            // headers are automatically repeated if the table spans over multiple pages
            // you can declare how many rows should be treated as headers
            headerRows: 0,
            widths: ['*', '*'],

            body: [
              [{ text: 'Premio:', bold: true }, this.validacionBundle.descripcion],
              [{ text: 'Nombre (Si es Obsequio):', bold: true }, nombrePremio]
            ],
            // Grosor y color de las líneas de la tabla
            layout: {
              hLineWidth: function (i: any, node: any) {
                return 1; // Grosor de las líneas horizontales
              },
              vLineWidth: function (i: any, node: any) {
                return 1; // Grosor de las líneas verticales
              },
              hLineColor: function (i: any, node: any) {
                return '#000000'; // Color de las líneas horizontales
              },
              vLineColor: function (i: any, node: any) {
                return '#000000'; // Color de las líneas verticales
              }
            }
          }
        },
        {
          columns: [
            {
              stack: [
                { text: 'FIRMA CLIENTE', style: 'firmaTitulo' },
                {
                  image: this.firmaBase64,
                  fit: [200, 200]
                },
                {
                  canvas: [
                    { type: 'line', x1: 0, y1: 0, x2: 200, y2: 0, lineWidth: 1 }
                  ]
                },
                { text: 'DNI Cliente: ' + this.validacionBundle.strdnicliente, style: 'textoFirma' }
              ],
              width: '50%',
              alignment: 'center'
            },
            // {
            //   stack: [
            //     { text: 'FIRMA SUPERVISOR', style: 'firmaTitulo' },
            //     {
            //       image: this.firmaBase64, // Asegúrate de tener esta variable definida
            //       fit: [200, 200]
            //     },
            //     {
            //       canvas: [
            //         { type: 'line', x1: 0, y1: 0, x2: 200, y2: 0, lineWidth: 1 }
            //       ]
            //     },
            //     { text: 'DNI Supervisor: ' + this.validacionBundle.strdnicliente, style: 'textoFirma' }
            //   ],
            //   width: '50%',
            //   alignment: 'center'
            // }
          ]
        }
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 20, 0, 20],
          alignment: 'center'
        },
        paragraph: {
          fontSize: 12,
          margin: [0, 0, 0, 10]
        },
        headerTable: {
          fontSize: 12,
          margin: [0, 20, 0, 10]
        },
        agradecimiento: {
          fontSize: 12,
          margin: [0, 5, 0, 20]
        },
        firmaTitulo: {
          fontSize: 12,
          bold: true,
          margin: [0, 50, 0, 20]
        },
        textoFirma: {
          fontSize: 10,
          margin: [0, 5, 0, 20]
        }
      },
      images: {
        logo_header: this.logoBase64,
        imgBase64: this.firmaBase64
      }
    };
  }

  getDataById(id: number): void {
    this.validacionBundlesService.getById(id).subscribe(data => {
      // Aquí puedes hacer lo que necesites con los datos obtenidos
      console.log(data);
      this.validacionBundle = data;

      if (this.validacionBundle.flagcodigoauthbundle === 2) {
        this.isShow = false;
        return
      }

      if (this.validacionBundle.intbundleid === 137) {
        this.esObsequio = true;
      }

      console.log('this.validacionBundle', this.validacionBundle);

      this.bundleForm.patchValue({
        nombrepromotor: data.nombrepromotor,
        dnicliente: data.strdnicliente,
        producto: data.strproductodesc,
        nombrebundle: data.descripcion,
      });
    });
  }

  resizeSignaturePad() {
    const containerWidth = document.getElementById("sign_canvas")?.offsetWidth;
    const containerHeight = document.getElementById("sign_canvas")?.offsetHeight;

    if (containerWidth && containerHeight && this.signaturePad) {
      this.signaturePad.options = this.signaturePadOptions;
      console.log('Resized canvas', containerWidth, containerHeight);

      this.signaturePad?.set('canvasWidth', containerWidth);
    }
  }

  verdimensiones() {
    const containerWidth = document.getElementById("sign_canvas")?.offsetWidth;
    const containerHeight = document.getElementById("sign_canvas")?.offsetHeight;

    if (containerWidth && containerHeight && this.signaturePad) {
      this.signaturePad.options = this.signaturePadOptions;
      console.log('Resized canvas', containerWidth, containerHeight);
      this.signaturePad?.set('canvasWidth', containerWidth);
      // this.signaturePadOptions.canvasWidth = containerWidth;
      // this.signaturePadOptions.canvasHeight = containerHeight;
      // this.signaturePad.clear();
    }
  }

  guardarFirma() {
    console.log('isEmpty()', this.signaturePad?.isEmpty());

    if (!this.signaturePad?.isEmpty()) {
      const signatureBase64 = this.signaturePad?.toDataURL(); // Obtener la firma en formato Base64
      console.log('Firma en Base64:', signatureBase64);
      this.firmaBase64 = '';
      this.firmaBase64 = signatureBase64 || ''; // Asignar la firma Base64 a la variable para mostrarla en la plantilla
    }
  }

  limpiarFirma() {
    this.signaturePad?.clear();
    this.firmaBase64 = ''; // Limpiar la variable de la firma Base64
  }

  createFormBundle(): UntypedFormGroup {
    return this.fb.group({
      codigoAutenticacion: new FormControl('', Validators.compose([
        Validators.required,
      ])),
      // intidventasprincipal: new FormControl('', Validators.compose([
      //   Validators.required,
      // ])),
      nombrepromotor: new FormControl('', Validators.compose([
        Validators.required,
      ])),
      dnicliente: new FormControl('', Validators.compose([
        Validators.required,
      ])),
      producto: new FormControl('', Validators.compose([
        Validators.required,
      ])),
      nombrebundle: new FormControl('', Validators.compose([
        Validators.required,
      ])),
      nombreobsequio: new FormControl('', Validators.compose([
        Validators.required,
      ])),
      celularcliente: new FormControl('', Validators.compose([
        Validators.required,
      ])),
      firma: new FormControl('', Validators.compose([
        Validators.required,
      ])),
    });
  }

  transformToUpperCase(event: Event): void {
    const input = event.target as HTMLInputElement;
    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;

    input.value = input.value.toUpperCase();
    input.setSelectionRange(start, end);

    this.bundleForm.get('nombreobsequio')?.setValue(input.value, { emitEvent: false });
  }

  get nombreobsequio() {
    return this.bundleForm.get('nombreobsequio');
  }

  firmar() {
    Swal.fire({
      title: "Do you want to save the changes?",
      html: `
      <signature-pad style="width: 100%; height: 200px;" #signature fxFlex="1 1 50%"
      (window:resize)="resizeSignaturePad()" class="signature" id="sign_canvas"
      fxFlexAlign.xs="center"></signature-pad>
      `,
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: "Save",
      denyButtonText: `Don't save`
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        Swal.fire("Saved!", "", "success");
      } else if (result.isDenied) {
        Swal.fire("Changes are not saved", "", "info");
      }
    });
  }

  postCodigoAutenticacion() {
    // this.isValidated = true;
    let strcodigoauthbundle = this.bundleForm.get('codigoAutenticacion')?.value;

    console.log('codigoAuth', strcodigoauthbundle)

    const intventasromid = this.validacionBundle.intventasromid;

    if (intventasromid !== undefined && strcodigoauthbundle) {
      this.validacionBundlesService.ValidarCodigoAuthBundle(intventasromid, strcodigoauthbundle).subscribe(res => {
        if (res.mensaje === 'OK') {
          this.isKeyIn = true;
          this.isValidated = true;
          Swal.fire({
            title: "Autenticado",
            text: "Código Validado",
            icon: "success"
          });
        } else {
          Swal.fire({
            title: "Alerta",
            text: "Código no válido",
            icon: "warning"
          });
        }
      })
    } else {
      Swal.fire({
        title: "Alerta",
        text: "Debe escribir el código de autenticación",
        icon: "warning"
      });
    }
  }

  removeSpaces(): void {
    let control = this.bundleForm.get('codigoAutenticacion');
    if (control) {
      let value = control.value.replace(/\s+/g, '');
      control.setValue(value, { emitEvent: false });
    }
  }

}

