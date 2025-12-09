'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScanLine, CheckCircle, XCircle, AlertTriangle, Camera } from 'lucide-react';
import { QRScanner } from '@/components/inspector/QRScanner';

export default function InspectorPage() {
  const [scanning, setScanning] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleScan = async (data: string) => {
    try {
      setLoading(true);
      setVerificationResult(null);

      // Parse QR code data
      const qrData = JSON.parse(data);
      const { ticketId, tokenId, eventId } = qrData;

      // Verify ticket
      const response = await apiClient.request('/api/inspector/verify', {
        method: 'POST',
        body: JSON.stringify({
          ticketId,
          tokenId,
          eventId,
        }),
      });

      setVerificationResult(response);
      setScanning(false);

      // Auto-clear result after 5 seconds
      setTimeout(() => {
        setVerificationResult(null);
      }, 5000);

    } catch (error: any) {
      setVerificationResult({
        success: false,
        error: error.message || 'Invalid QR code',
        status: 'ERROR',
      });
      setScanning(false);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'VALID':
        return 'bg-green-500';
      case 'ALREADY_USED':
        return 'bg-yellow-500';
      case 'INVALID':
      case 'OWNERSHIP_FAILED':
      case 'WRONG_EVENT':
        return 'bg-red-500';
      case 'LISTED':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'VALID':
        return <CheckCircle className="h-16 w-16 text-green-500" />;
      case 'ALREADY_USED':
        return <AlertTriangle className="h-16 w-16 text-yellow-500" />;
      default:
        return <XCircle className="h-16 w-16 text-red-500" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Ticket Inspector</h1>
          <p className="text-muted-foreground">
            Scan QR codes to verify and check-in tickets
          </p>
        </div>

        {/* Scanner Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ScanLine className="h-5 w-5" />
              QR Code Scanner
            </CardTitle>
            <CardDescription>
              Point camera at ticket QR code to verify
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!scanning ? (
              <div className="text-center py-8">
                <Camera className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <Button
                  size="lg"
                  onClick={() => setScanning(true)}
                  className="gap-2"
                >
                  <ScanLine className="h-5 w-5" />
                  Start Scanning
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <QRScanner
                  onScan={handleScan}
                  onError={(error) => {
                    console.error('Scanner error:', error);
                    setVerificationResult({
                      success: false,
                      error: 'Scanner error: ' + error,
                      status: 'ERROR',
                    });
                  }}
                />
                <Button
                  variant="outline"
                  onClick={() => setScanning(false)}
                  className="w-full"
                >
                  Stop Scanning
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Verification Result */}
        {verificationResult && (
          <Card className={`border-2 ${verificationResult.success ? 'border-green-500' : 'border-red-500'}`}>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                {getStatusIcon(verificationResult.status)}
                
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    {verificationResult.success ? 'Valid Ticket' : 'Invalid Ticket'}
                  </h2>
                  <Badge className={getStatusColor(verificationResult.status)}>
                    {verificationResult.status}
                  </Badge>
                </div>

                {verificationResult.success ? (
                  <div className="space-y-2 text-left bg-muted p-4 rounded-lg">
                    {verificationResult.event && (
                      <>
                        <div>
                          <p className="text-sm text-muted-foreground">Event</p>
                          <p className="font-semibold">{verificationResult.event.title}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Venue</p>
                          <p className="font-semibold">
                            {verificationResult.event.venue.name}, {verificationResult.event.venue.city}
                          </p>
                        </div>
                      </>
                    )}
                    <div>
                      <p className="text-sm text-muted-foreground">Token ID</p>
                      <p className="font-mono text-sm">{verificationResult.ticket?.tokenId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Checked in by</p>
                      <p className="font-semibold">{verificationResult.ticket?.checkedInBy}</p>
                    </div>
                    {verificationResult.verificationTime && (
                      <div>
                        <p className="text-sm text-muted-foreground">Verification time</p>
                        <p className="font-semibold">{verificationResult.verificationTime}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <Alert variant="destructive">
                    <AlertDescription>
                      {verificationResult.error}
                      {verificationResult.usedAt && (
                        <p className="mt-2 text-sm">
                          Previously used at: {new Date(verificationResult.usedAt).toLocaleString()}
                        </p>
                      )}
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  onClick={() => {
                    setVerificationResult(null);
                    setScanning(true);
                  }}
                  className="w-full"
                >
                  Scan Next Ticket
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        {!scanning && !verificationResult && (
          <Card>
            <CardHeader>
              <CardTitle>How to Use</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>Click "Start Scanning" to activate camera</li>
                <li>Point camera at ticket QR code</li>
                <li>Wait for automatic verification</li>
                <li>Check result (Valid/Invalid)</li>
                <li>Scan next ticket</li>
              </ol>
              
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="text-xs font-semibold mb-1">Verification checks:</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>✓ Ticket exists in database</li>
                  <li>✓ Token ID matches</li>
                  <li>✓ NFT ownership verified on-chain</li>
                  <li>✓ Not previously used</li>
                  <li>✓ Not listed for resale</li>
                  <li>✓ Verification completes in &lt;3 seconds</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
