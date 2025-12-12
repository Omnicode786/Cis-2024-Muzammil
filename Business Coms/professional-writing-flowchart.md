# Professional Writing Mind Map

This document uses **Mermaid.js** syntax to render a dynamic flowchart. You can view this diagram in any Markdown editor that supports Mermaid (like VS Code, GitHub, Obsidian, or Notion).

## Visual Flowchart

```mermaid
graph LR
    %% Main Node
    Root((Professional Writing))

    %% Styles
    classDef main fill:#f9f,stroke:#333,stroke-width:4px,font-weight:bold;
    classDef type fill:#e1f5fe,stroke:#0277bd,stroke-width:2px,font-weight:bold;
    classDef detail fill:#fff9c4,stroke:#fbc02d,stroke-width:1px;
    
    class Root main;

    %% Branch 1: Memo / Notice
    Root --> Memo[Memo / Notice]
    class Memo type;
    Memo --- M_Purpose(<strong>Purpose</strong><br/>Internal communication,<br/>announcement, instructions)
    Memo --- M_Key(<strong>Key Questions</strong><br/>Who? What? When?<br/>Where? Why? Action?)
    Memo --- M_Struct(<strong>Structure</strong><br/>To / From / Date / Subject<br/>↓<br/>Body<br/>↓<br/>Attachments)
    Memo --- M_Tone(<strong>Tone</strong><br/>Concise, neutral, professional)
    class M_Purpose,M_Key,M_Struct,M_Tone detail;

    %% Branch 2: Cover Letter
    Root --> Cover[Cover Letter]
    class Cover type;
    Cover --- C_Purpose(<strong>Purpose</strong><br/>Apply for job / internship,<br/>highlight skills)
    Cover --- C_Key(<strong>Key Questions</strong><br/>Position, Skills, Projects,<br/>Motivation, Call to action)
    Cover --- C_Struct(<strong>Structure</strong><br/>Intro<br/>↓<br/>Skills/Experience<br/>↓<br/>Motivation<br/>↓<br/>Closing)
    Cover --- C_Tone(<strong>Tone</strong><br/>Professional + personality)
    class C_Purpose,C_Key,C_Struct,C_Tone detail;

    %% Branch 3: Resume / CV
    Root --> Resume[Resume / CV]
    class Resume type;
    Resume --- R_Purpose(<strong>Purpose</strong><br/>Showcase education,<br/>skills, experience)
    Resume --- R_Key(<strong>Key Questions</strong><br/>Edu, Skills, Projects,<br/>Exp, Achievements)
    Resume --- R_Struct(<strong>Structure</strong><br/>Contact → Summary<br/>↓<br/>Edu → Skills → Projects<br/>↓<br/>Exp → Achievements)
    Resume --- R_Tone(<strong>Tone</strong><br/>Factual, concise, scannable)
    class R_Purpose,R_Key,R_Struct,R_Tone detail;

    %% Branch 4: Report
    Root --> Report[Report]
    class Report type;
    Report --- Rep_Purpose(<strong>Purpose</strong><br/>Analyze, summarize,<br/>recommend)
    Report --- Rep_Key(<strong>Key Questions</strong><br/>Topic, Data/Findings,<br/>Analysis, Conclusion)
    Report --- Rep_Struct(<strong>Structure</strong><br/>Title → Exec Summary<br/>↓<br/>Intro → Findings<br/>↓<br/>Discussion → Recs)
    Report --- Rep_Tone(<strong>Tone</strong><br/>Formal, factual)
    class Rep_Purpose,Rep_Key,Rep_Struct,Rep_Tone detail;

    %% Branch 5: Inquiry Letter
    Root --> Inquiry[Inquiry / Request]
    class Inquiry type;
    Inquiry --- I_Purpose(<strong>Purpose</strong><br/>Request info / clarification<br/>/ quotation)
    Inquiry --- I_Key(<strong>Key Questions</strong><br/>Who (recipient), Purpose,<br/>Info needed, Action)
    Inquiry --- I_Struct(<strong>Structure</strong><br/>Intro<br/>↓<br/>Details<br/>↓<br/>Request → Closing)
    Inquiry --- I_Tone(<strong>Tone</strong><br/>Polite, formal)
    class I_Purpose,I_Key,I_Struct,I_Tone detail;

    %% Branch 6: Formal Letter
    Root --> Formal[Formal Business Letter]
    class Formal type;
    Formal --- F_Purpose(<strong>Purpose</strong><br/>External or formal<br/>communication)
    Formal --- F_Key(<strong>Key Questions</strong><br/>Recipient, Purpose,<br/>Body, Closing)
    Formal --- F_Struct(<strong>Structure</strong><br/>Address → Date<br/>↓<br/>Recipient → Salutation<br/>↓<br/>Body → Closing)
    Formal --- F_Tone(<strong>Tone</strong><br/>Formal, professional)
    class F_Purpose,F_Key,F_Struct,F_Tone detail;

    %% Branch 7: Minutes of Meeting
    Root --> MoM[Minutes of Meeting]
    class MoM type;
    MoM --- Mom_Purpose(<strong>Purpose</strong><br/>Record discussions<br/>& decisions)
    MoM --- Mom_Key(<strong>Key Questions</strong><br/>Date/Time, Attendance,<br/>Agenda, Decisions)
    MoM --- Mom_Struct(<strong>Structure</strong><br/>Info → Attendance<br/>↓<br/>Agenda → Decisions<br/>↓<br/>Adjournment)
    MoM --- Mom_Tone(<strong>Tone</strong><br/>Factual, concise)
    class Mom_Purpose,Mom_Key,Mom_Struct,Mom_Tone detail;
```

## How to Use This File
1. **VS Code**: Install the "Markdown Preview Mermaid Support" extension.
2. **Obsidian**: Paste this directly; it works natively.
3. **GitHub**: Upload this file; GitHub renders it automatically.
4. **Online**: Paste the code block above into [Mermaid Live Editor](https://mermaid.live).
