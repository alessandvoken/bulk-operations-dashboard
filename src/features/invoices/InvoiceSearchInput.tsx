import { TextInput } from '@mantine/core';
import { useDebouncedCallback } from '@mantine/hooks';

import { useState } from 'react';

type InvoiceSearchInputProps = {
  query: string;
  onQueryChange: (q: string) => void;
};

export function InvoiceSearchInput({
  query,
  onQueryChange,
}: InvoiceSearchInputProps) {
  const [queryDraft, setQueryDraft] = useState(query);
  const [prevQuery, setPrevQuery] = useState(query);

  if (query !== prevQuery) {
    setPrevQuery(query);
    setQueryDraft(query);
  }

  const debouncedQueryChange = useDebouncedCallback(onQueryChange, 300);

  return (
    <TextInput
      maw={280}
      w="100%"
      label="Search invoices"
      value={queryDraft}
      placeholder="Customer or invoice number"
      onChange={(e) => {
        setQueryDraft(e.currentTarget.value);
        debouncedQueryChange(e.currentTarget.value);
      }}
    />
  );
}
