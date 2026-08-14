insert into public.departments (ulb_id, name, description)
select u.id, d.name, d.description
from public.ulbs u
cross join (values
 ('Account Section','Income and Expenditure. Maintaining records of accounts.'),
 ('Engineering Section','Civil Works - Tendering and Execution.'),
 ('Health and Sanitation','Cleanliness and Greenery. Birth and Death records updation. Maintain visible cleanliness of the Municipality.'),
 ('Revenue Section','Increase and Collection of Taxes. Assessments and Tax Collections.'),
 ('Town Planning','Permissions and Building Permissions.')
) as d(name, description)
where u.slug in ('mulugu','moinabad','kohir','chevella','aswaraopeta','kalluru')
and not exists (select 1 from public.departments x where x.ulb_id = u.id);