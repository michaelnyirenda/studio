"use client";

import type { UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Bold, Italic, Heading1, Heading2, List, ListOrdered } from 'lucide-react';
import type { ForumPostFormData } from '@/lib/schemas';
import type { RefObject } from 'react';

interface MarkdownToolbarProps {
  editorRef: RefObject<HTMLTextAreaElement>;
  form: UseFormReturn<ForumPostFormData>;
}

export default function MarkdownToolbar({ editorRef, form }: MarkdownToolbarProps) {
    const { setValue, getValues } = form;

    const applyFormat = (formatType: 'bold' | 'italic') => {
        const textarea = editorRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const content = getValues('content');
        const selectedText = content.substring(start, end);
        const delimiter = formatType === 'bold' ? '**' : '*';
        
        const newText = `${content.substring(0, start)}${delimiter}${selectedText}${delimiter}${content.substring(end)}`;
        setValue('content', newText, { shouldDirty: true });

        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + delimiter.length, end + delimiter.length);
        }, 0);
    };
    
    const applyHeading = (level: 1 | 2) => {
        const textarea = editorRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const content = getValues('content');
        const lineStart = content.lastIndexOf('\n', start - 1) + 1;
        
        const prefix = `${'#'.repeat(level)} `;
        const newText = `${content.substring(0, lineStart)}${prefix}${content.substring(lineStart)}`;
        setValue('content', newText, { shouldDirty: true });

        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + prefix.length, start + prefix.length);
        }, 0);
    };

    const applyList = (listType: 'bullet' | 'ordered') => {
        const textarea = editorRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const content = getValues('content');
        const selectedText = content.substring(start, end);

        const lines = selectedText.split('\n');
        const prefix = listType === 'bullet' ? '- ' : '1. ';
        const newList = lines.map((line, index) => {
            if (listType === 'ordered') {
                return `${index + 1}. ${line}`;
            }
            return `${prefix}${line}`;
        }).join('\n');

        const newText = `${content.substring(0, start)}${newList}${content.substring(end)}`;
        setValue('content', newText, { shouldDirty: true });

         setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start, start + newList.length);
        }, 0);
    };

    return (
        <div className="flex items-center gap-1 border rounded-md p-1 bg-transparent mb-2">
            <Button type="button" variant="ghost" size="icon" onClick={() => applyHeading(1)} title="Heading 1"><Heading1 className="h-4 w-4" /></Button>
            <Button type="button" variant="ghost" size="icon" onClick={() => applyHeading(2)} title="Heading 2"><Heading2 className="h-4 w-4" /></Button>
            <Button type="button" variant="ghost" size="icon" onClick={() => applyFormat('bold')} title="Bold"><Bold className="h-4 w-4" /></Button>
            <Button type="button" variant="ghost" size="icon" onClick={() => applyFormat('italic')} title="Italic"><Italic className="h-4 w-4" /></Button>
            <Button type="button" variant="ghost" size="icon" onClick={() => applyList('bullet')} title="Bulleted List"><List className="h-4 w-4" /></Button>
            <Button type="button" variant="ghost" size="icon" onClick={() => applyList('ordered')} title="Numbered List"><ListOrdered className="h-4 w-4" /></Button>
        </div>
    );
}
