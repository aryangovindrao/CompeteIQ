import React from 'react';
import {
  Document,
  Image as PDFImage,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from '@react-pdf/renderer';
import QRCode from 'qrcode';

const styles = StyleSheet.create({
  page: {
    padding: 0,
    fontFamily: 'Helvetica',
    backgroundColor: '#FFFFFF',
  },
  border: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    bottom: 16,
    borderWidth: 2,
    borderColor: '#C0392B',
    borderRadius: 8,
  },
  innerBorder: {
    position: 'absolute',
    top: 24,
    left: 24,
    right: 24,
    bottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 6,
  },
  content: {
    paddingTop: 64,
    paddingHorizontal: 64,
    paddingBottom: 48,
  },
  brand: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#C0392B',
    letterSpacing: 2,
  },
  banner: {
    marginTop: 4,
    fontSize: 12,
    color: '#6B7280',
    letterSpacing: 4,
  },
  title: {
    marginTop: 40,
    fontSize: 36,
    fontFamily: 'Helvetica-Bold',
    color: '#1A1A1A',
    textAlign: 'center',
  },
  divider: {
    width: 80,
    height: 3,
    backgroundColor: '#C0392B',
    marginVertical: 20,
    marginHorizontal: 'auto',
  },
  awardedTo: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    letterSpacing: 2,
  },
  recipient: {
    marginTop: 12,
    fontSize: 28,
    fontFamily: 'Helvetica-Bold',
    color: '#1A1A1A',
    textAlign: 'center',
  },
  paragraph: {
    marginTop: 24,
    fontSize: 13,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 1.6,
  },
  competition: {
    fontFamily: 'Helvetica-Bold',
    color: '#C0392B',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 48,
    marginTop: 32,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: '#1A1A1A',
  },
  statLabel: {
    marginTop: 4,
    fontSize: 10,
    color: '#6B7280',
    letterSpacing: 1,
  },
  footer: {
    position: 'absolute',
    left: 64,
    right: 64,
    bottom: 56,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  footerColLeft: {
    flexDirection: 'column',
  },
  signatureLine: {
    width: 160,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
    marginBottom: 4,
  },
  signature: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 12,
    color: '#1A1A1A',
  },
  signatureRole: {
    fontSize: 10,
    color: '#6B7280',
  },
  qrBlock: {
    alignItems: 'center',
  },
  qrCaption: {
    marginTop: 6,
    fontSize: 9,
    color: '#6B7280',
  },
  verifyId: {
    marginTop: 2,
    fontSize: 8,
    color: '#9CA3AF',
  },
});

export interface CertificatePdfData {
  certificateId: string;
  studentName: string;
  competitionTitle: string;
  score: number;
  rank: number;
  issuedAt: Date;
  institutionName: string;
  signerName: string;
  signerRole: string;
  verifyUrl: string;
}

function CertificateDocument({ data, qrDataUrl }: { data: CertificatePdfData; qrDataUrl: string }) {
  return (
    <Document title={`Certificate — ${data.competitionTitle}`} author={data.institutionName}>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.border} />
        <View style={styles.innerBorder} />

        <View style={styles.content}>
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.brand}>COMPETEIQ</Text>
            <Text style={styles.banner}>CERTIFICATE OF ACHIEVEMENT</Text>
          </View>

          <Text style={styles.title}>{data.competitionTitle}</Text>
          <View style={styles.divider} />

          <Text style={styles.awardedTo}>THIS CERTIFICATE IS PROUDLY AWARDED TO</Text>
          <Text style={styles.recipient}>{data.studentName}</Text>

          <Text style={styles.paragraph}>
            in recognition of outstanding performance in{' '}
            <Text style={styles.competition}>{data.competitionTitle}</Text>, hosted by{' '}
            {data.institutionName} on {data.issuedAt.toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}.
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{data.score}%</Text>
              <Text style={styles.statLabel}>FINAL SCORE</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>#{data.rank}</Text>
              <Text style={styles.statLabel}>RANK</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.footerColLeft}>
            <View style={styles.signatureLine} />
            <Text style={styles.signature}>{data.signerName}</Text>
            <Text style={styles.signatureRole}>{data.signerRole}</Text>
          </View>

          <View style={styles.qrBlock}>
            <PDFImage src={qrDataUrl} style={{ width: 64, height: 64 }} />
            <Text style={styles.qrCaption}>Scan to verify</Text>
            <Text style={styles.verifyId}>ID: {data.certificateId}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

export async function renderCertificatePdf(data: CertificatePdfData): Promise<Buffer> {
  const qrDataUrl = await QRCode.toDataURL(data.verifyUrl, {
    width: 256,
    margin: 1,
    color: { dark: '#1A1A1A', light: '#FFFFFF' },
  });
  const buffer = await renderToBuffer(<CertificateDocument data={data} qrDataUrl={qrDataUrl} />);
  return buffer;
}
