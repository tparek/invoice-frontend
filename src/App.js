import React, { useState, useEffect } from 'react';
import './App.css';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import tetonLogo from './teton_logo.jpg';

const MY_COMPANY = {
  name: 'Teton Productions OÜ',
  address: 'Kullerkupu 20, Verijärve küla, Võrumaa, Võru vald 65541',
  regNr: '14695419',
  kmkrNr: 'EE102643996',
};

const BANK_INFO = {
  bank: 'AS LHV PANK',
  account: 'EE437700771003739128',
};

const VAT_RATE = 0.22;

function App() {
  const [invoiceNumber, setInvoiceNumber] = useState(182);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [paymentTerm, setPaymentTerm] = useState('7');
  const [client, setClient] = useState({
    companyName: '',
    address: '',
    regNr: '',
    kmkrNr: '',
  });
  const [services, setServices] = useState([
    { description: '', amount: 1, price: 0, sum: 0 },
  ]);
  const [subtotal, setSubtotal] = useState(0);
  const [vat, setVat] = useState(0);
  const [total, setTotal] = useState(0);

  // Fetch next invoice number from backend
  useEffect(() => {
    fetch('https://invoice-backend-r6a9.onrender.com/invoices')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setInvoiceNumber(Math.max(...data.map(inv => inv.invoice_number)) + 1);
        }
      });
  }, []);

  // Calculate sums
  useEffect(() => {
    const newServices = services.map(s => ({ ...s, sum: s.amount * s.price }));
    setServices(newServices);
    const sub = newServices.reduce((acc, s) => acc + s.sum, 0);
    setSubtotal(sub);
    setVat(sub * VAT_RATE);
    setTotal(sub + sub * VAT_RATE);
    // eslint-disable-next-line
  }, [JSON.stringify(services)]);

  const handleServiceChange = (idx, field, value) => {
    const updated = services.map((s, i) =>
      i === idx ? { ...s, [field]: field === 'description' ? value : Number(value) } : s
    );
    setServices(updated);
  };

  const addService = () => {
    setServices([...services, { description: '', amount: 1, price: 0, sum: 0 }]);
  };

  const removeService = idx => {
    setServices(services.filter((_, i) => i !== idx));
  };

  const handleClientChange = (field, value) => {
    setClient({ ...client, [field]: value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const invoice = {
      date,
      payment_term: paymentTerm,
      client_company_name: client.companyName,
      client_address: client.address,
      client_reg_nr: client.regNr,
      client_kmkr_nr: client.kmkrNr,
      services,
      subtotal,
      vat,
      total,
    };
    const res = await fetch('https://invoice-backend-r6a9.onrender.com/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invoice),
    });
    if (res.ok) {
      alert('Invoice saved!');
    } else {
      alert('Error saving invoice');
    }
  };

  // Format date for display (dd.mm.yyyy)
  const formatDate = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('en-GB');
  };

  // Calculate payment due date
  const paymentDue = () => {
    const d = new Date(date);
    d.setDate(d.getDate() + Number(paymentTerm));
    return formatDate(d.toISOString().slice(0, 10));
  };

  // PDF export handler
  const handleDownloadPDF = async () => {
    const invoiceElement = document.getElementById('invoice-area');
    if (!invoiceElement) return;
    const canvas = await html2canvas(invoiceElement, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    // Calculate image size to fit A4
    const imgWidth = pageWidth - 40;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 20, 20, imgWidth, imgHeight);
    pdf.save(`invoice_${invoiceNumber}.pdf`);
  };

  return (
    <div className="App">
      <form onSubmit={handleSubmit}>
        {/* Only wrap the PDF content in a hidden div for export */}
        <div id="invoice-area" className="invoice-pdf-style" style={{ position: 'absolute', left: '-9999px', top: 0 }}>
          <div className="invoice-header">
            <img src={tetonLogo} alt="Teton Logo" className="logo" />
            <div className="header-info">
              <div style={{ fontSize: '2em', marginBottom: 32 }}>Invoice nr {invoiceNumber}</div>
              <div style={{ marginBottom: 24 }}>
                Date: <span>{formatDate(date)}</span>
              </div>
              <div><b>Payment term:</b> {paymentDue()}</div>
              <div style={{ marginTop: 16, fontWeight: 'bold' }}>{MY_COMPANY.name}</div>
              <div>{MY_COMPANY.address}</div>
              <div><b>Reg. nr:</b> {MY_COMPANY.regNr}</div>
              <div><b>KMKR nr:</b> {MY_COMPANY.kmkrNr}</div>
            </div>
          </div>
          <div className="recipient-section">
            <div className="recipient-block">
              <div style={{ fontWeight: 'bold', marginBottom: 6 }}>INVOICE RECIPIENT</div>
              <div><strong>{client.companyName || 'Client Company Name'}</strong></div>
              <div>{client.address || 'Client Address'}</div>
              <div><b>Reg. nr:</b> {client.regNr || '...'}</div>
              <div><b>KMKR nr.:</b> {client.kmkrNr || '...'}</div>
            </div>
            <div style={{ flex: 1 }}></div>
          </div>
          <div className="table-section">
            <table className="services-table">
              <thead>
                <tr>
                  <th>DESCRIPTION</th>
                  <th>AMOUNT</th>
                  <th>PRICE</th>
                  <th>SUM</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {services.map((s, idx) => (
                  <tr key={idx}>
                    <td>{s.description}</td>
                    <td>{s.amount}</td>
                    <td>{s.price.toFixed(2)} €</td>
                    <td>{s.sum.toFixed(2)} €</td>
                    <td></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="totals">
            <div>SUM {subtotal.toFixed(2)} €</div>
            <div>VAT 22% {vat.toFixed(2)} €</div>
            <div className="total">TOTAL {total.toFixed(2)} €</div>
          </div>
          <div className="bank-info" style={{ marginTop: 64 }}>
            <div>{BANK_INFO.bank}</div>
            <div>Bank account  number: {BANK_INFO.account}</div>
          </div>
        </div>
        {/* On-screen UI: only show the form */}
        <div className="onscreen-form">
          <div style={{ fontSize: '1.5em', marginBottom: 10 }}>Invoice nr {invoiceNumber}</div>
          <div style={{ marginBottom: 10 }}>
            <label>Date: </label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ marginRight: 10 }} />
            <label>Payment term: </label>
            <input type="number" min="1" value={paymentTerm} onChange={e => setPaymentTerm(e.target.value)} style={{ width: 60, marginRight: 10 }} /> days
          </div>
          <div className="recipient-section">
            <div className="recipient-block">
              <div style={{ fontWeight: 'bold', marginBottom: 6 }}>INVOICE RECIPIENT</div>
              <input
                type="text"
                placeholder="Client Company Name"
                value={client.companyName}
                onChange={e => handleClientChange('companyName', e.target.value)}
                required
                style={{ fontWeight: 'bold', marginBottom: 4, width: '100%' }}
              />
              <input
                type="text"
                placeholder="Client Address"
                value={client.address}
                onChange={e => handleClientChange('address', e.target.value)}
                required
                style={{ marginBottom: 4, width: '100%' }}
              />
              <input
                type="text"
                placeholder="Reg. nr"
                value={client.regNr}
                onChange={e => handleClientChange('regNr', e.target.value)}
                style={{ marginBottom: 4, width: '100%' }}
              />
              <input
                type="text"
                placeholder="KMKR nr."
                value={client.kmkrNr}
                onChange={e => handleClientChange('kmkrNr', e.target.value)}
                style={{ marginBottom: 4, width: '100%' }}
              />
            </div>
            <div style={{ flex: 1 }}></div>
          </div>
          <div className="table-section">
            <table className="services-table">
              <thead>
                <tr>
                  <th>DESCRIPTION</th>
                  <th>AMOUNT</th>
                  <th>PRICE</th>
                  <th>SUM</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {services.map((s, idx) => (
                  <tr key={idx}>
                    <td><input value={s.description} onChange={e => handleServiceChange(idx, 'description', e.target.value)} required /></td>
                    <td><input type="number" min="1" value={s.amount} onChange={e => handleServiceChange(idx, 'amount', e.target.value)} required /></td>
                    <td><input type="number" min="0" value={s.price} onChange={e => handleServiceChange(idx, 'price', e.target.value)} required /></td>
                    <td>{s.sum.toFixed(2)}</td>
                    <td>{services.length > 1 && <button type="button" onClick={() => removeService(idx)}>Remove</button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button type="button" onClick={addService}>Add Service</button>
          </div>
          <div className="totals">
            <div>SUM {subtotal.toFixed(2)} €</div>
            <div>VAT 22% {vat.toFixed(2)} €</div>
            <div className="total">TOTAL {total.toFixed(2)} €</div>
          </div>
        </div>
        <div style={{ marginTop: 24 }}>
          <button type="submit">Save Invoice</button>
          <button type="button" onClick={handleDownloadPDF} style={{ marginLeft: 10 }}>Download PDF</button>
        </div>
      </form>
    </div>
  );
}

export default App;
