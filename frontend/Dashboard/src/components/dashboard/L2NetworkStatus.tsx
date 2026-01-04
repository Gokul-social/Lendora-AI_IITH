import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Network, Zap, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

interface L2NetworkStatusProps {
  mode: 'l2' | 'direct' | 'unavailable';
  connected?: boolean;
  networkState?: string;
  activeNegotiations?: number;
  currentSessionId?: string;
}

export function L2NetworkStatus({ mode, connected, networkState, activeNegotiations, currentSessionId }: L2NetworkStatusProps) {
  const getModeColor = (mode: string) => {
    switch (mode) {
      case 'l2':
        return 'bg-green-500';
      case 'direct':
        return 'bg-blue-500';
      case 'unavailable':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'l2':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'direct':
        return <Network className="w-4 h-4" />;
      case 'unavailable':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getNetworkStateColor = (state?: string) => {
    switch (state) {
      case 'Connected':
        return 'bg-green-500';
      case 'Connecting':
        return 'bg-yellow-500';
      case 'Disconnected':
        return 'bg-red-500';
      case 'Idle':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getModeLabel = (mode: string) => {
    switch (mode) {
      case 'l2':
        return 'Arbitrum L2';
      case 'direct':
        return 'Ethereum Mainnet';
      default:
        return mode;
    }
  };

  return (
    <Card className="glass-panel p-6 border border-border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
          <Zap className="w-5 h-5 text-primary" />
          Layer 2 Network Status
        </h3>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={`${getModeColor(mode)} text-white border-0`}>
            {getModeIcon(mode)}
            <span className="ml-1">{getModeLabel(mode)}</span>
          </Badge>
          {connected !== undefined && (
            <Badge variant="outline" className={connected ? 'bg-green-500 text-white border-0' : 'bg-red-500 text-white border-0'}>
              {connected ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
              <span className="ml-1 text-xs">
                {connected ? 'Connected' : 'Disconnected'}
              </span>
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Network State */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Network State</p>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`${getNetworkStateColor(networkState)} text-white border-0`}>
              {networkState || 'Unknown'}
            </Badge>
          </div>
        </div>

        {/* Active Negotiations */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Active Negotiations</p>
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold text-foreground">
              {activeNegotiations || 0}
            </div>
            <span className="text-sm text-muted-foreground">sessions</span>
          </div>
        </div>
      </div>

      {/* Mode Description */}
      <div className="mt-4 p-4 rounded-lg bg-secondary/30 border border-border">
        <div className="flex items-start gap-3">
          {mode === 'l2' ? (
            <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
          ) : mode === 'direct' ? (
            <Network className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          )}

          <div>
            <p className="text-sm font-semibold mb-1 text-foreground">
              {mode === 'l2'
                ? 'Arbitrum Layer 2 Active'
                : mode === 'direct'
                ? 'Direct Ethereum Transactions'
                : 'Layer 2 Unavailable'
              }
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {mode === 'l2'
                ? 'Low-cost negotiations on Arbitrum Layer 2'
                : mode === 'direct'
                ? 'Direct blockchain transactions with standard gas fees'
                : 'Layer 2 connection required for optimal performance'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Session Information */}
      {((activeNegotiations && activeNegotiations > 0) || currentSessionId) && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 p-4 rounded-lg bg-primary/10 border border-primary/30"
        >
          <p className="text-sm font-semibold text-primary mb-3">
            Active Sessions
          </p>
          <div className="space-y-2">
            {/* Display current session if available */}
            {currentSessionId && (
              <div className="flex items-center justify-between text-sm p-3 rounded bg-secondary/30 border border-border">
                <div className="flex flex-col">
                  <span className="font-mono font-semibold text-foreground text-xs">{currentSessionId}</span>
                  <span className="text-muted-foreground text-xs mt-1">Current negotiation session</span>
                </div>
                <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/40">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  {networkState || 'Active'}
                </Badge>
              </div>
            )}

            {/* Display additional active sessions */}
            {activeNegotiations && activeNegotiations > (currentSessionId ? 1 : 0) && (
              <>
                {Array.from({ length: Math.min(activeNegotiations - (currentSessionId ? 1 : 0), 4) }, (_, i) => (
                  <div key={i + (currentSessionId ? 1 : 0)} className="flex items-center justify-between text-sm p-3 rounded bg-secondary/30 border border-border">
                    <div className="flex flex-col">
                      <span className="font-mono font-semibold text-foreground text-xs">session_{String(i + 1).padStart(3, '0')}</span>
                      <span className="text-muted-foreground text-xs mt-1">Low-gas negotiation active</span>
                    </div>
                    <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/40">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                ))}
              </>
            )}

            {/* Show count if no specific sessions */}
            {!currentSessionId && activeNegotiations && activeNegotiations > 0 && (
              <div className="text-sm text-muted-foreground text-center py-2">
                {activeNegotiations} active negotiation{activeNegotiations !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </Card>
  );
}
