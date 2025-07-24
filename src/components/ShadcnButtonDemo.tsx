import React from 'react';
import { Button } from './ui/button';

function ShadcnButtonDemo() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Button onClick={() => alert('Botão clicado!')}>
        Clique-me
      </Button>
    </div>
  );
}

export default ShadcnButtonDemo;