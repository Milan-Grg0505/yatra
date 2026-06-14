// import { useState, useRef, useEffect, type FormEvent } from 'react';
// import { v4 as uuidv4 } from 'uuid';
// import { LuSend, LuSparkles, LuMessageCircle, LuX } from 'react-icons/lu';
// import { Avatar, Button, Spinner } from '@/components/atoms';
// import { useAppDispatch, useAppSelector, useAuth } from '@/hooks';
// import { selectAi, pushUserMessage, clearMessages } from '@/features/slices/aiSlice';
// import { sendChatMessageThunk } from '@/features/thunks/aiThunks';
// import { AI_SUGGESTIONS } from '@/lib/constants';
// import { cn } from '@/lib/utils';

// export function ChatBot({ floating = false }: { floating?: boolean }) {
//   const dispatch = useAppDispatch();
//   const { user } = useAuth();
//   const { messages, loading, currentSessionId } = useAppSelector(selectAi);
//   const [text, setText] = useState('');
//   const [open, setOpen] = useState(!floating);
//   const sessionIdRef = useRef<string>(currentSessionId ?? uuidv4());
//   const bottomRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [messages, loading]);

//   const send = (e?: FormEvent, override?: string) => {
//     e?.preventDefault();
//     const msg = (override ?? text).trim();
//     if (!msg || loading) return;
//     dispatch(pushUserMessage(msg));
//     dispatch(sendChatMessageThunk({ message: msg, session_id: sessionIdRef.current }));
//     setText('');
//   };

//   const inner = (
//     <div className={cn('flex flex-col h-full bg-surface dark:bg-dark-surface', floating ? 'rounded-2xl' : '')}>
//       <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border dark:border-dark-border">
//         <div className="flex items-center gap-2">
//           <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white">
//             <LuSparkles className="h-5 w-5" />
//           </div>
//           <div>
//             <p className="font-semibold text-text dark:text-dark-text">Yatra Assistant</p>
//             <p className="text-xs text-text-3">AI travel guide</p>
//           </div>
//         </div>
//         {floating && (
//           <Button size="icon-sm" variant="ghost" onClick={() => setOpen(false)}>
//             <LuX className="h-4 w-4" />
//           </Button>
//         )}
//         {!floating && messages.length > 0 && (
//           <Button size="sm" variant="ghost" onClick={() => {
//             dispatch(clearMessages());
//             sessionIdRef.current = uuidv4();
//           }}>
//             New chat
//           </Button>
//         )}
//       </div>

//       <div className="flex-1 overflow-y-auto p-4 space-y-3">
//         {messages.length === 0 && (
//           <div className="text-center py-6">
//             <p className="text-sm text-text-2 mb-4">Ask me anything about hotels & travel in Nepal.</p>
//             <div className="flex flex-wrap justify-center gap-2">
//               {AI_SUGGESTIONS.map((s) => (
//                 <button
//                   key={s}
//                   onClick={() => send(undefined, s)}
//                   className="text-xs px-3 py-1.5 rounded-full bg-surface-2 dark:bg-dark-surface-2 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition border border-border dark:border-dark-border"
//                 >
//                   {s}
//                 </button>
//               ))}
//             </div>
//           </div>
//         )}
//         {messages.map((m, i) => (
//           <div key={i} className={cn('flex gap-2', m.role === 'user' ? 'justify-end' : 'justify-start')}>
//             {m.role === 'assistant' && (
//               <div className="h-8 w-8 shrink-0 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white">
//                 <LuSparkles className="h-4 w-4" />
//               </div>
//             )}
//             <div
//               className={cn(
//                 'max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm whitespace-pre-wrap',
//                 m.role === 'user'
//                   ? 'bg-primary-600 text-white rounded-br-sm'
//                   : 'bg-surface-2 dark:bg-dark-surface-2 text-text dark:text-dark-text rounded-bl-sm',
//               )}
//             >
//               {m.content}
//             </div>
//             {m.role === 'user' && user && <Avatar src={user.image} name={user.name} size="sm" />}
//           </div>
//         ))}
//         {loading && (
//           <div className="flex items-center gap-2 text-text-3 text-xs">
//             <Spinner size="sm" /> Thinking…
//           </div>
//         )}
//         <div ref={bottomRef} />
//       </div>

//       <form onSubmit={send} className="flex items-center gap-2 p-3 border-t border-border dark:border-dark-border">
//         <input
//           value={text}
//           onChange={(e) => setText(e.target.value)}
//           placeholder="Type your message…"
//           className="flex-1 h-10 px-3.5 rounded-lg bg-surface-2 dark:bg-dark-surface-2 text-sm outline-none focus:ring-2 focus:ring-primary-500/30"
//         />
//         <Button type="submit" size="icon" disabled={loading || !text.trim()}>
//           <LuSend className="h-4 w-4" />
//         </Button>
//       </form>
//     </div>
//   );

//   if (!floating) return inner;

//   return (
//     <>
//       <button
//         onClick={() => setOpen(true)}
//         className={cn(
//           'fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full bg-primary-600 text-white shadow-elevated hover:bg-primary-700 transition flex items-center justify-center',
//           open && 'hidden',
//         )}
//         aria-label="Open chat"
//       >
//         <LuMessageCircle className="h-6 w-6" />
//       </button>
//       {open && (
//         <div className="fixed bottom-6 right-6 z-50 w-[380px] h-[560px] max-w-[calc(100vw-2rem)] shadow-elevated rounded-2xl overflow-hidden border border-border dark:border-dark-border">
//           {inner}
//         </div>
//       )}
//     </>
//   );
// }
