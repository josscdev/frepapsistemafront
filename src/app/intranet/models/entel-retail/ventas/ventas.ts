export class Ventas {
    idventas?: number;
    fechaoperacion?: string; // Fecha en formato string
    docpromotorasesor?: string;
    idpdv?: number;
    idtipodocumento?: number;
    doccliente?: string;
    idtipobiometria?: number;
    numcelularcontrato?: string;
    correocliente?: string;
    observacion?: string;
    nombrevoucher?: string;
    numeroruc?: string;
    codcomprobante?: string;
    numeroserie?: string;
    numero?: string;
    fechaemisionvoucher?: string; // Fecha en formato string
    montovoucher?: number;
    tramaqrcode?: string;
    idemppaisnegcue?: number;
    estado?: number;
    usuariocreacion?: string;
    fechacreacion?: string; // Fecha en formato string
    usuariomodificacion?: string;
    fechamodificacion?: string; // Fecha en formato string
    usuarioanulacion?: string;
    fechaanulacion?: string;
    ventasDetalles?: VentasDetalle[];
}

export class VentasDetalle {
    idventasdetalle?: number;
    idventas?: number;
    idsubproducto?: number;
    nombresubproducto?:string;
    idoperador?: number;
    nombreoperador?:string;
    idtipoequipo?: number;
    nombretipoequipo?:string;
    idtiposeguro?: number;
    nombretiseguro?:string;
    montoupselling?: number;
    idtipoetiqueta?: number;
    nombretipoetiqueta?:string;
    idtipopago?: number;
    nombrepago?:string;
    idplan?: number;
    nombreplan?:string;
    idmodelo?: number;
    nombremodelo?:string;
    imeiequipo?: string;
    imeisim?: string;
    iccid?: string;
    idbundle?: number;
    nombrebundle?:string;
    pagocaja?: number;
    numerocelular?: string;
    idtipoaccesorio?: number;
    nombretipoaccesorio?:string;
    cantidadaccesorio?: number;
    pagoaccesorio?: number;
    imeiaccesorio?: string;
    numeroorden?: string;
    ventasromimeicoincide?: string; // CHAR(2) en formato string
    codigoauthbundle?: string;
    flagcodigoauthbundle?: number;
    idemppaisnegcue?: number;
    estado?: number;
    usuariocreacion?: string;
    fechacreacion?: string; // Fecha en formato string
    usuariomodificacion?: string;
    fechamodificacion?: string; // Fecha en formato string
    usuarioanulacion?: string;
    fechaanulacion?: string;
}

export class VentasRequest{
    venta?: Ventas;
    ventasDetalles?: VentasDetalle[];
}

export class UploadImageRequest{
    Base64Image?: string;
    VoucherName?: string;
}

export class ActualizarNombreVoucherRequest{
    idventa?: number;
    nombrevoucher?: string;
}