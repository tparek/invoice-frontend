<div id="invoice-area" className="invoice-pdf-style" style={{ position: 'absolute', left: '-9999px', top: 0 }}>
  <div className="invoice-header">
    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', width: '100%' }}>
      <img src={tetonLogo} alt="Teton Logo" className="logo" style={{ width: 120, height: 'auto', marginRight: 32 }} />
      <div className="header-info" style={{ flex: 1, textAlign: 'right' }}>
        <div style={{ fontSize: '2em', marginBottom: 10 }}>Invoice nr {invoiceNumber}</div>
        <div>Date: <span>{formatDate(date)}</span></div>
        <div><b>Payment term:</b> {paymentDue()}</div>
        <div style={{ marginTop: 16, fontWeight: 'bold' }}>{MY_COMPANY.name}</div>
        <div>{MY_COMPANY.address}</div>
        <div><b>Reg. nr:</b> {MY_COMPANY.regNr}</div>
        <div><b>KMKR nr:</b> {MY_COMPANY.kmkrNr}</div>
      </div>
    </div>
  </div>
  <div className="recipient-sender-row" style={{ display: 'flex', flexDirection: 'row', marginTop: 32, marginBottom: 16 }}>
    <div className="recipient-block" style={{ minWidth: 320, fontSize: '1.1em', fontFamily: 'Times New Roman, Times, serif' }}>
      <div style={{ fontWeight: 'bold', marginBottom: 6 }}>INVOICE RECIPIENT</div>
      <div><strong>{client.companyName || 'Client Company Name'}</strong></div>
      <div>{client.address || 'Client Address'}</div>
      <div><b>Reg. nr:</b> {client.regNr || '...'}</div>
      <div><b>KMKR nr.:</b> {client.kmkrNr || '...'}</div>
    </div>
    <div style={{ flex: 1 }}></div>
    <div className="sender-block" style={{ minWidth: 320, fontSize: '1.1em', fontFamily: 'Times New Roman, Times, serif', textAlign: 'right' }}>
      <div style={{ fontWeight: 'bold', marginBottom: 6 }}>{MY_COMPANY.name}</div>
      <div>{MY_COMPANY.address}</div>
      <div><b>Reg. nr:</b> {MY_COMPANY.regNr}</div>
      <div><b>KMKR nr:</b> {MY_COMPANY.kmkrNr}</div>
    </div>
  </div>
  <hr className="invoice-separator" />
  <div className="bank-info" style={{ marginTop: 64 }}>
    <div>{BANK_INFO.bank}</div>
    <div>Bank account  number: {BANK_INFO.account}</div>
  </div>
</div> 