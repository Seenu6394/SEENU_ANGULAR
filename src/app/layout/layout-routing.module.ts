import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LayoutComponent } from './layout.component';
import { AuthGuard } from '../shared';

const routes: Routes = [
    {
        path: '', component: LayoutComponent,
        children: [
            { path: 'signup', loadChildren: './signup/signup.module#SignupModule', canActivate: [AuthGuard]},
            { path: 'dashboard', loadChildren: './dashboard/dashboard.module#DashboardModule', canActivate: [AuthGuard] },
            { path: 're', loadChildren: './re/re.module#ReModule', canActivate: [AuthGuard]  },
            { path: 'settings', loadChildren: './settings/settings.module#SettingsModule', canActivate: [AuthGuard]  },
            { path: 'changepassword', loadChildren: './changepassword/ch.module#ChModule', canActivate: [AuthGuard]  },
            { path: 'mapping', loadChildren: './mapping/mapping.module#MappingModule', canActivate: [AuthGuard]  },
            { path: 'mapping/:kuId', loadChildren: './mapping/mapping.module#MappingModule', canActivate: [AuthGuard]  },
            { path: 'mapping/:intentId/:kuId', loadChildren: './mapping/mapping.module#MappingModule', canActivate: [AuthGuard]  },
            { path: 'conversation', loadChildren: './conversation/conversation.module#ConversationModule', canActivate: [AuthGuard]  },
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class LayoutRoutingModule { }
