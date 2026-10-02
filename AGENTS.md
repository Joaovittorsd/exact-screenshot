<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep the prototype privacy-first: remote camera and screen actions must show explicit consent on the monitored device, because covert capture is out of scope.
- Keep user-owned Ninho data in Lovable Cloud behind row-level ownership policies; use realtime subscriptions only inside mounted effects with cleanup.
- Keep the web simulator and native Android client on the same command/telemetry contract; sensitive capture commands require auditable device consent.
