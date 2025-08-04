// jsPDF AutoTable type declarations
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => void;
  }
}

declare module 'jspdf-autotable' {
  const autoTable: (doc: any, options: any) => void;
  export default autoTable;
}
