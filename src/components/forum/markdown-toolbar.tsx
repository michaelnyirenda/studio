"use client";

import type { UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Bold, Italic, Heading1, Heading2, List, ListOrdered, Image, Youtube, Music } from 'lucide-react';
import type { ForumPostFormData } from '@/lib/schemas';
import type { RefObject } from 'react';

interface MarkdownToolbarProps {
  editorRef: RefObject<HTMLTextAreaElement>;
  form: UseFormReturn<ForumPostFormData>;
}

export default function MarkdownToolbar({ editorRef, form }: MarkdownToolbarProps) {
    const { setValue, getValues } = form;

    const insertText = (textToInsert: string, cursorPositionOffset: number) => {
         const textarea = editorRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const content = getValues('content');
        
        const newText = `${content.substring(0, start)}${textToInsert}${content.substring(end)}`;
        setValue('content', newText, { shouldDirty: true });

        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + cursorPositionOffset, start + cursorPositionOffset);
        }, 0);
    };

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

    const applyMedia = (mediaType: 'image' | 'video' | 'audio') => {
        let textToInsert = '';
        let offset = 0;
        switch(mediaType) {
            case 'image':
                textToInsert = '\n![Image alt text](https://placehold.co/600x400.png)\n';
                offset = 20; // moves cursor to middle of alt text
                break;
            case 'video':
                textToInsert = '\n[video](https://www.youtube.com/watch?v=dQw4w9WgXcQ)\n';
                offset = 9; // places cursor in the parentheses
                break;
            case 'audio':
                textToInsert = '\n[audio](https://example.com/audio.mp3)\n';
                offset = 9;
                break;
        }
         insertText(textToInsert, textToInsert.length - 2);
    };

    return (
        <div className="flex items-center gap-1 border rounded-md p-1 bg-transparent mb-2 flex-wrap">
            <Button type="button" variant="ghost" size="icon" onClick={() => applyHeading(1)} title="Heading 1"><Heading1 className="h-4 w-4" /></Button>
            <Button type="button" variant="ghost" size="icon" onClick={() => applyHeading(2)} title="Heading 2"><Heading2 className="h-4 w-4" /></Button>
            <Button type="button" variant="ghost" size="icon" onClick={() => applyFormat('bold')} title="Bold"><Bold className="h-4 w-4" /></Button>
            <Button type="button" variant="ghost" size="icon" onClick={() => applyFormat('italic')} title="Italic"><Italic className="h-4 w-4" /></Button>
            <Button type="button" variant="ghost" size="icon" onClick={() => applyList('bullet')} title="Bulleted List"><List className="h-4 w-4" /></Button>
            <Button type="button" variant="ghost" size="icon" onClick={() => applyList('ordered')} title="Numbered List"><ListOrdered className="h-4 w-4" /></Button>
            <Button type="button" variant="ghost" size="icon" onClick={() => applyMedia('image')} title="Insert Image"><Image className="h-4 w-4" /></Button>
            <Button type="button" variant="ghost" size="icon" onClick={() => applyMedia('video')} title="Insert YouTube Video"><Youtube className="h-4 w-4" /></Button>
            <Button type="button" variant="ghost" size="icon" onClick={() => applyMedia('audio')} title="Insert Audio"><Music className="h-4 w-4" /></Button>
        </div>
    );
}
